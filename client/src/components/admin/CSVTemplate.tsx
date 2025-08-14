import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const CSVTemplate: React.FC = () => {
  const generateCSVTemplate = () => {
    const headers = ['Name', 'Email', 'Organization', 'Category', 'Website', 'Phone', 'Address'];
    const sampleData = [
      ['John Smith', 'john@radiostation.com', 'Power 105.1 FM', 'radio_stations', 'https://power105.com', '+1-555-0101', '123 Radio Ave, NYC'],
      ['Sarah Johnson', 'sarah@musicblog.com', 'Indie Music Weekly', 'music_blogs', 'https://indiemusicweekly.com', '+1-555-0102', '456 Blog St, LA'],
      ['Mike Davis', 'mike@festival.org', 'Summer Music Festival', 'festival_organizers', 'https://summerfest.org', '+1-555-0103', '789 Event Blvd, Chicago']
    ];
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipient_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generateCSVTemplate}
      className="mb-4"
    >
      <Download className="h-4 w-4 mr-2" />
      Download CSV Template
    </Button>
  );
};

export default CSVTemplate;