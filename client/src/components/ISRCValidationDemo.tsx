import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Lock, Unlock, RotateCcw } from 'lucide-react';

import ISRCValidationInput from './ISRCValidationInput';
import ISRCServiceForm from './ISRCServiceForm';

export default function ISRCValidationDemo() {
  const [isValidationDemo, setIsValidationDemo] = useState(true);
  const [demoValue, setDemoValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  const examples = [
    { label: 'Valid Format', value: 'DM-A0D-25-00-001', valid: true },
    { label: 'Too Short', value: 'DM-A0D-25-00-01', valid: false },
    { label: 'Too Long', value: 'DM-A0D-25-00-0001', valid: false },
    { label: 'Wrong Country', value: 'US-A0D-25-00-001', valid: false },
    { label: 'Wrong Identifier', value: 'DM-XYZ-25-00-001', valid: false },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ISRC Format Validation System
            <Badge variant="default">Strict Character Count</Badge>
          </CardTitle>
          <CardDescription>
            Demonstration of the ISRC format validation system with exact 11-character count enforcement.
            The form unlocks only when the ISRC format exactly matches DM-A0D-YY-NN-XXX (12 characters excluding hyphens).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={isValidationDemo ? "default" : "outline"}
              onClick={() => setIsValidationDemo(true)}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Validation Demo
            </Button>
            <Button
              variant={!isValidationDemo ? "default" : "outline"}
              onClick={() => setIsValidationDemo(false)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Full ISRC Service Form
            </Button>
          </div>

          {isValidationDemo ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interactive Validation Test</h3>
                <ISRCValidationInput
                  value={demoValue}
                  onChange={setDemoValue}
                  onValidationChange={setIsValid}
                  label="Test ISRC Format"
                  placeholder="Enter ISRC to test validation"
                />
                
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  {isValid ? (
                    <>
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Valid ISRC - Form would unlock</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">Invalid ISRC - Form remains locked</span>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDemoValue('');
                      setIsValid(false);
                    }}
                    className="ml-auto"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Example ISRC Formats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {examples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <Badge variant={example.valid ? "default" : "destructive"}>
                        {example.label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDemoValue(example.value)}
                        className="w-full font-mono text-xs"
                      >
                        {example.value}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Validation Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium">Character Count</div>
                    <div className="text-muted-foreground">
                      • Exactly 12 characters (ignoring hyphens)<br />
                      • Any deviation locks the form<br />
                      • Real-time character count display
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Format Pattern</div>
                    <div className="text-muted-foreground">
                      • DM = Dominica country code<br />
                      • A0D = Wai'tuMusic IFPI identifier<br />
                      • YY-NN-XXX = Year, Artist ID, Song Number
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">IFPI Monitoring</div>
                    <div className="text-muted-foreground">
                      • OppHub monitors ifpi.org for format updates<br />
                      • New formats allowed only if IFPI reports them<br />
                      • Current format strictly enforced
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Form Unlock</div>
                    <div className="text-muted-foreground">
                      • All form fields locked until ISRC valid<br />
                      • Visual feedback with lock/unlock icons<br />
                      • Submit button disabled when locked
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ISRCServiceForm userId={1} onSuccess={() => {}} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}