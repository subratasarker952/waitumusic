/**
 * Music Industry Standard Components
 * Platform-specific components following industry best practices
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Music, 
  Briefcase,
  Star,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

// Opportunity card following industry standards
export interface OpportunityCardProps {
  id: number;
  title: string;
  organization: string;
  location: string;
  deadline: string;
  compensationType: 'paid' | 'unpaid' | 'revenue_share' | 'experience';
  amount?: string;
  description: string;
  category: string;
  isRemote: boolean;
  applicationCount: number;
  isFeatured?: boolean;
  tags?: string[];
  onApply: () => void;
  onView: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  className?: string;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  title,
  organization,
  location,
  deadline,
  compensationType,
  amount,
  description,
  category,
  isRemote,
  applicationCount,
  isFeatured = false,
  tags = [],
  onApply,
  onView,
  onFavorite,
  onShare,
  className,
}) => {
  const compensationColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    unpaid: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    revenue_share: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    experience: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  const compensationLabels = {
    paid: amount || 'Paid',
    unpaid: 'Unpaid',
    revenue_share: 'Revenue Share',
    experience: 'Experience',
  };

  return (
    <Card className={cn(
      'relative transition-all duration-200 hover:shadow-md cursor-pointer',
      isFeatured && 'ring-2 ring-yellow-400 shadow-lg',
      className
    )}>
      {isFeatured && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 line-clamp-2 hover:text-primary">
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">{organization}</p>
          </div>
          <Badge variant="outline" className="ml-2 text-xs">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>

        {/* Key details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{location}</span>
            {isRemote && <Badge variant="secondary" className="ml-2 text-xs">Remote</Badge>}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <Badge className={cn('text-xs', compensationColors[compensationType])}>
              {compensationLabels[compensationType]}
            </Badge>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{applicationCount} applications</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onFavorite && (
              <Button variant="ghost" size="sm" onClick={onFavorite}>
                <Heart className="h-4 w-4" />
              </Button>
            )}
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={onApply}>
              Apply Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Artist/Musician profile card
export interface ProfileCardProps {
  name: string;
  stageName?: string;
  role: string;
  location: string;
  genres: string[];
  instruments?: string[];
  avatar?: string;
  coverImage?: string;
  isVerified?: boolean;
  rating?: number;
  completedGigs?: number;
  isOnline?: boolean;
  onView: () => void;
  onContact?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  stageName,
  role,
  location,
  genres,
  instruments = [],
  avatar,
  isVerified = false,
  rating,
  completedGigs,
  isOnline = false,
  onView,
  onContact,
  className,
}) => {
  return (
    <Card className={cn('relative transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="relative">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-primary" />
              </div>
            )}
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm truncate">
                {stageName || name}
              </h3>
              {isVerified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{role}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats */}
        {(rating || completedGigs) && (
          <div className="flex items-center justify-between text-xs">
            {rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            {completedGigs && (
              <div className="flex items-center">
                <Briefcase className="h-3 w-3 mr-1" />
                <span>{completedGigs} gigs</span>
              </div>
            )}
          </div>
        )}

        {/* Genres */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Genres</p>
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Instruments */}
        {instruments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Instruments</p>
            <div className="flex flex-wrap gap-1">
              {instruments.slice(0, 2).map((instrument) => (
                <Badge key={instrument} variant="secondary" className="text-xs">
                  {instrument}
                </Badge>
              ))}
              {instruments.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{instruments.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            View Profile
          </Button>
          {onContact && (
            <Button size="sm" className="flex-1" onClick={onContact}>
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Stats dashboard card
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = 'stable',
  className,
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn('text-xs mt-1', trendColors[trend])}>
                {change.value > 0 ? '+' : ''}{change.value}% from {change.period}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};