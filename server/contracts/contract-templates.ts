export const contractTemplates = {
  booking_agreement: {
    title: 'Performance Booking Agreement',
    sections: [
      {
        title: 'Parties',
        content: `This Performance Booking Agreement ("Agreement") is entered into on {{date}} between:
        
        PURCHASER ("Booker"):
        Name: {{booker.name}}
        Email: {{booker.email}}
        Phone: {{booker.phone}}
        
        and
        
        ARTIST(S) ("Talent"):
        {{#each talent}}
        - {{this.name}} ({{this.role}})
        {{/each}}`
      },
      {
        title: 'Performance Details',
        content: `Event Name: {{event.name}}
        Date: {{event.date}}
        Venue: {{event.venue}}
        Address: {{event.address}}
        Performance Time: {{event.performanceTime}}
        Sound Check: {{event.soundCheckTime}}`
      },
      {
        title: 'Compensation',
        content: `Total Budget: \${{event.totalBudget}}
        Payment Schedule: {{event.paymentSchedule}}
        Payment Method: {{event.paymentMethod}}`
      },
      {
        title: 'Technical Requirements',
        content: `Technical requirements will be provided in a separate Technical Rider document.`
      },
      {
        title: 'Terms and Conditions',
        content: `1. Cancellation Policy: {{terms.cancellationPolicy}}
        2. Force Majeure: Standard industry terms apply
        3. Liability: Each party responsible for their own equipment
        4. Recording Rights: {{terms.recordingRights}}`
      }
    ]
  },
  
  performance_contract: {
    title: 'Individual Performance Contract',
    sections: [
      {
        title: 'Performer Information',
        content: `This contract is between {{venue.name}} and:
        
        Performer: {{performer.name}}
        Stage Name: {{performer.stageName}}
        Role: {{performer.role}}
        Contact: {{performer.email}}`
      },
      {
        title: 'Performance Obligations',
        content: `The Performer agrees to:
        1. Arrive at venue by {{performance.loadInTime}}
        2. Complete sound check by {{performance.soundCheckTime}}
        3. Perform for {{performance.duration}}
        4. Provide professional performance quality`
      },
      {
        title: 'Compensation',
        content: `Performance Fee: \${{compensation.amount}}
        Payment Method: {{compensation.paymentMethod}}
        Payment Schedule: {{compensation.paymentSchedule}}`
      },
      {
        title: 'Technical & Hospitality',
        content: `Technical requirements as specified in Technical Rider
        Hospitality requirements as agreed`
      }
    ]
  }
};

export function fillTemplate(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value = data;
    
    for (const key of keys) {
      if (key.startsWith('#each ')) {
        // Handle array iteration
        const arrayPath = key.substring(6);
        const array = getValueByPath(data, arrayPath);
        if (Array.isArray(array)) {
          return array.map(item => 
            template.substring(
              template.indexOf(match) + match.length,
              template.indexOf('{{/each}}')
            ).replace(/\{\{this\.([^}]+)\}\}/g, (m, p) => item[p] || '')
          ).join('\n');
        }
      }
      value = value?.[key];
    }
    
    return value || '';
  });
}

function getValueByPath(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    value = value?.[key];
  }
  return value;
}