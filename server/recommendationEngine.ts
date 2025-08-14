import { storage } from './storage';
import { 
  UserInteraction, 
  InsertUserInteraction, 
  MusicRecommendation, 
  InsertMusicRecommendation,
  User,
  Song,
  Artist,
  TrendingMetric,
  InsertTrendingMetric,
  ArtistSimilarity,
  InsertArtistSimilarity,
  UserPreferences,
  InsertUserPreferences
} from '@shared/schema';

// Recommendation Algorithm Engine
export class RecommendationEngine {
  
  // Track user interactions (plays, likes, shares, etc.)
  async trackInteraction(interaction: InsertUserInteraction): Promise<void> {
    try {
      await storage.createUserInteraction(interaction);
      
      // Update trending metrics
      await this.updateTrendingMetrics(interaction);
      
      // Generate real-time recommendations for user
      this.generateRecommendationsForUser(interaction.userId);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  // Generate personalized recommendations for a user
  async generateRecommendationsForUser(userId: number): Promise<MusicRecommendation[]> {
    try {
      const userPreferences = await storage.getUserPreferences(userId);
      const userInteractions = await storage.getUserInteractions(userId);
      
      const recommendations: InsertMusicRecommendation[] = [];

      // 1. Genre-based recommendations
      const genreRecs = await this.getGenreBasedRecommendations(userId, userPreferences, userInteractions);
      recommendations.push(...genreRecs);

      // 2. Similar artist recommendations
      const similarArtistRecs = await this.getSimilarArtistRecommendations(userId, userInteractions);
      recommendations.push(...similarArtistRecs);

      // 3. Collaborative filtering recommendations
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId, userInteractions);
      recommendations.push(...collaborativeRecs);

      // 4. Trending content
      const trendingRecs = await this.getTrendingRecommendations(userId);
      recommendations.push(...trendingRecs);

      // 5. Cross-promotion recommendations
      const crossPromotionRecs = await this.getCrossPromotionRecommendations(userId);
      recommendations.push(...crossPromotionRecs);

      // Clear old recommendations and save new ones
      await storage.clearUserRecommendations(userId);
      const savedRecommendations = await Promise.all(
        recommendations.map(rec => storage.createMusicRecommendation(rec))
      );

      return savedRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Genre-based recommendation algorithm
  private async getGenreBasedRecommendations(
    userId: number, 
    preferences: UserPreferences | null, 
    interactions: UserInteraction[]
  ): Promise<InsertMusicRecommendation[]> {
    const recommendations: InsertMusicRecommendation[] = [];
    
    // Extract user's preferred genres from preferences and interactions
    let preferredGenres: string[] = [];
    
    if (preferences?.preferredGenres) {
      preferredGenres = Array.isArray(preferences.preferredGenres) 
        ? preferences.preferredGenres as string[] 
        : [];
    }

    // If no explicit preferences, infer from listening history
    if (preferredGenres.length === 0) {
      const genreCounts: { [key: string]: number } = {};
      
      for (const interaction of interactions) {
        if (interaction.songId && (interaction.interactionType === 'play' || interaction.interactionType === 'like')) {
          const song = await storage.getSong(interaction.songId);
          if (song) {
            const artist = await storage.getArtist(song.artistUserId);
            if (artist?.genre) {
              genreCounts[artist.genre] = (genreCounts[artist.genre] || 0) + 1;
            }
          }
        }
      }
      
      preferredGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre);
    }

    // Find songs in preferred genres that user hasn't interacted with
    for (const genre of preferredGenres) {
      const genreSongs = await storage.getSongsByGenre(genre);
      const userSongIds = new Set(interactions.map(i => i.songId).filter(Boolean));
      
      const newSongs = genreSongs.filter(song => !userSongIds.has(song.id)).slice(0, 5);
      
      for (const song of newSongs) {
        recommendations.push({
          userId,
          songId: song.id,
          artistId: song.artistUserId,
          recommendationType: 'genre_based',
          score: 0.8,
          reasonCode: `Based on your interest in ${genre} music`,
          isActive: true
        });
      }
    }

    return recommendations;
  }

  // Similar artist recommendation algorithm
  private async getSimilarArtistRecommendations(
    userId: number, 
    interactions: UserInteraction[]
  ): Promise<InsertMusicRecommendation[]> {
    const recommendations: InsertMusicRecommendation[] = [];
    
    // Get artists user has interacted with positively
    const likedArtistIds = interactions
      .filter(i => i.artistId && ['play', 'like', 'download'].includes(i.interactionType))
      .map(i => i.artistId!)
      .filter((id, index, array) => array.indexOf(id) === index); // Unique IDs

    for (const artistId of likedArtistIds) {
      // Find similar artists
      const similarities = await storage.getArtistSimilarities(artistId);
      
      for (const similarity of similarities.slice(0, 3)) { // Top 3 similar artists
        const similarArtistId = similarity.artistId1 === artistId ? similarity.artistId2 : similarity.artistId1;
        const similarArtistSongs = await storage.getSongsByArtist(similarArtistId);
        
        // Get user's interaction history to avoid recommending heard songs
        const userSongIds = new Set(interactions.map(i => i.songId).filter(Boolean));
        const newSongs = similarArtistSongs.filter(song => !userSongIds.has(song.id)).slice(0, 2);
        
        for (const song of newSongs) {
          recommendations.push({
            userId,
            songId: song.id,
            artistId: similarArtistId,
            recommendationType: 'similar_artist',
            score: Number(similarity.similarityScore) || 0.7,
            reasonCode: `Similar to artists you like`,
            isActive: true
          });
        }
      }
    }

    return recommendations;
  }

  // Collaborative filtering algorithm
  private async getCollaborativeRecommendations(
    userId: number, 
    userInteractions: UserInteraction[]
  ): Promise<InsertMusicRecommendation[]> {
    const recommendations: InsertMusicRecommendation[] = [];
    
    // Find users with similar listening patterns
    const userSongIds = new Set(
      userInteractions
        .filter(i => i.songId && ['play', 'like'].includes(i.interactionType))
        .map(i => i.songId!)
    );

    if (userSongIds.size === 0) return recommendations;

    // Get all user interactions to find similar users
    const allInteractions = await storage.getAllUserInteractions();
    const userSimilarities: { [userId: number]: number } = {};

    // Calculate similarity with other users
    for (const interaction of allInteractions) {
      if (interaction.userId === userId || !interaction.songId) continue;
      
      if (userSongIds.has(interaction.songId) && ['play', 'like'].includes(interaction.interactionType)) {
        userSimilarities[interaction.userId] = (userSimilarities[interaction.userId] || 0) + 1;
      }
    }

    // Get recommendations from similar users
    const similarUsers = Object.entries(userSimilarities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 similar users
      .map(([userId]) => parseInt(userId));

    for (const similarUserId of similarUsers) {
      const similarUserInteractions = allInteractions.filter(
        i => i.userId === similarUserId && 
        i.songId && 
        ['play', 'like'].includes(i.interactionType) &&
        !userSongIds.has(i.songId!)
      );

      const topSongs = similarUserInteractions
        .slice(0, 3) // Top 3 songs from similar user
        .filter(i => i.songId);

      for (const interaction of topSongs) {
        recommendations.push({
          userId,
          songId: interaction.songId!,
          artistId: interaction.artistId,
          recommendationType: 'collaborative',
          score: 0.6,
          reasonCode: 'People with similar taste also like this',
          isActive: true
        });
      }
    }

    return recommendations;
  }

  // Trending content recommendations
  private async getTrendingRecommendations(userId: number): Promise<InsertMusicRecommendation[]> {
    const recommendations: InsertMusicRecommendation[] = [];
    
    // Get trending songs from last 7 days
    const trendingSongs = await storage.getTrendingSongs('weekly');
    const userInteractions = await storage.getUserInteractions(userId);
    const userSongIds = new Set(userInteractions.map(i => i.songId).filter(Boolean));

    const newTrendingSongs = trendingSongs
      .filter(song => !userSongIds.has(song.id))
      .slice(0, 5);

    for (const song of newTrendingSongs) {
      recommendations.push({
        userId,
        songId: song.id,
        artistId: song.artistUserId,
        recommendationType: 'trending',
        score: 0.9,
        reasonCode: 'Trending now on WaituMusic',
        isActive: true
      });
    }

    return recommendations;
  }

  // Cross-promotion recommendations
  private async getCrossPromotionRecommendations(userId: number): Promise<InsertMusicRecommendation[]> {
    const recommendations: InsertMusicRecommendation[] = [];
    
    // Get active cross-promotion campaigns
    const campaigns = await storage.getActiveCrossPromotionCampaigns();
    
    for (const campaign of campaigns.slice(0, 3)) { // Limit to 3 campaigns
      const promotedArtistSongs = await storage.getSongsByArtist(campaign.promotedArtistId);
      
      if (promotedArtistSongs.length > 0) {
        const song = promotedArtistSongs[0]; // Feature the artist's latest/top song
        
        recommendations.push({
          userId,
          songId: song.id,
          artistId: campaign.promotedArtistId,
          recommendationType: 'cross_promotion',
          score: 0.5,
          reasonCode: 'Featured artist',
          isActive: true
        });

        // Track campaign impression
        await storage.incrementCampaignImpressions(campaign.id);
      }
    }

    return recommendations;
  }

  // Update trending metrics based on user interactions
  private async updateTrendingMetrics(interaction: InsertUserInteraction): Promise<void> {
    if (!interaction.songId && !interaction.artistId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metricTypes = ['daily', 'weekly', 'monthly'];
    
    for (const timeframe of metricTypes) {
      if (interaction.songId) {
        await storage.incrementTrendingMetric({
          songId: interaction.songId,
          metricType: interaction.interactionType,
          timeframe,
          count: 1,
          date: today
        });
      }

      if (interaction.artistId) {
        await storage.incrementTrendingMetric({
          artistId: interaction.artistId,
          metricType: interaction.interactionType,
          timeframe,
          count: 1,
          date: today
        });
      }
    }
  }

  // Calculate artist similarities based on common fans and genres
  async calculateArtistSimilarities(): Promise<void> {
    try {
      const artists = await storage.getAllArtists();
      
      for (let i = 0; i < artists.length; i++) {
        for (let j = i + 1; j < artists.length; j++) {
          const artist1 = artists[i];
          const artist2 = artists[j];
          
          // Calculate similarity score
          const similarity = await this.calculateSimilarityScore(artist1.userId, artist2.userId);
          
          if (similarity.score > 0.1) { // Only store meaningful similarities
            await storage.createArtistSimilarity({
              artistId1: artist1.userId,
              artistId2: artist2.userId,
              similarityScore: similarity.score,
              commonGenres: similarity.commonGenres,
              sharedFans: similarity.sharedFans
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calculating artist similarities:', error);
    }
  }

  // Calculate similarity score between two artists
  private async calculateSimilarityScore(artistId1: number, artistId2: number): Promise<{
    score: number;
    commonGenres: string[];
    sharedFans: number;
  }> {
    const artist1 = await storage.getArtist(artistId1);
    const artist2 = await storage.getArtist(artistId2);
    
    let score = 0;
    const commonGenres: string[] = [];
    let sharedFans = 0;

    // Genre similarity
    if (artist1?.genre && artist2?.genre) {
      if (artist1.genre === artist2.genre) {
        score += 0.5;
        commonGenres.push(artist1.genre);
      }
    }

    // Shared fans analysis
    const artist1Fans = await storage.getArtistFans(artistId1);
    const artist2Fans = await storage.getArtistFans(artistId2);
    
    const sharedFanSet = new Set(artist1Fans.filter(fan => artist2Fans.includes(fan)));
    sharedFans = sharedFanSet.size;
    
    if (sharedFans > 0) {
      score += Math.min(0.4, sharedFans / Math.max(artist1Fans.length, artist2Fans.length));
    }

    // Music style analysis (could be enhanced with more sophisticated algorithms)
    // For now, we'll use a basic heuristic
    score += Math.random() * 0.1; // Placeholder for music analysis

    return {
      score: Math.min(1.0, score),
      commonGenres,
      sharedFans
    };
  }

  // Get recommendations for display
  async getRecommendationsForUser(userId: number, limit: number = 10): Promise<MusicRecommendation[]> {
    return storage.getUserRecommendations(userId, limit);
  }

  // Mark recommendation as viewed/clicked
  async trackRecommendationEngagement(recommendationId: number, engagementType: 'viewed' | 'clicked'): Promise<void> {
    await storage.updateRecommendationEngagement(recommendationId, engagementType);
  }

  // Update user preferences
  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<void> {
    await storage.updateUserPreferences(userId, preferences);
    
    // Regenerate recommendations after preference update
    this.generateRecommendationsForUser(userId);
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();