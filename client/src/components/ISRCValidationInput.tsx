import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Lock, Unlock } from 'lucide-react';

interface ISRCValidationInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export default function ISRCValidationInput({ 
  value, 
  onChange, 
  onValidationChange, 
  disabled = false,
  label = "ISRC Code",
  placeholder = "DM-A0D-25-00-001"
}: ISRCValidationInputProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    error?: string;
    characterCount: number;
  }>({ isValid: false, characterCount: 0 });

  const [showDetails, setShowDetails] = useState(false);

  // Validate ISRC format with strict character count
  const validateISRC = (isrc: string) => {
    const cleanISRC = isrc.replace(/-/g, '');
    const characterCount = cleanISRC.length;
    
    // Check exact character count first (11 characters without hyphens: DM=2, A0D=3, YY=2, NN=2, XXX=3)
    // Display shows 12 characters total to include hyphens for user clarity
    if (characterCount !== 11) {
      return {
        isValid: false,
        error: characterCount < 11 ? 
          `ISRC too short: ${characterCount + 4}/12 characters (missing ${11 - characterCount})` :
          `ISRC too long: ${characterCount + 4}/12 characters (excess ${characterCount - 11})`,
        characterCount
      };
    }
    
    // Check full format pattern: DM-A0D-YY-NN-XXX
    const pattern = /^DM-A0D-\d{2}-\d{2}-\d{3}$/;
    if (!pattern.test(isrc)) {
      return {
        isValid: false,
        error: "ISRC format must be: DM-A0D-YY-NN-XXX",
        characterCount
      };
    }
    
    return { isValid: true, characterCount };
  };

  // Validate whenever value changes
  useEffect(() => {
    if (value.trim()) {
      const result = validateISRC(value);
      setValidation(result);
      onValidationChange(result.isValid);
    } else {
      setValidation({ isValid: false, characterCount: 0 });
      onValidationChange(false);
    }
  }, [value, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const getValidationColor = () => {
    if (!value.trim()) return "text-muted-foreground";
    return validation.isValid ? "text-green-600" : "text-red-600";
  };

  const getValidationIcon = () => {
    if (!value.trim()) return <Lock className="h-4 w-4 text-muted-foreground" />;
    return validation.isValid ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="isrc-input" className="flex items-center gap-2">
        {label}
        {getValidationIcon()}
        {validation.isValid && (
          <Unlock className="h-4 w-4 text-green-600" title="Form unlocked" />
        )}
      </Label>
      
      <div className="space-y-2">
        <Input
          id="isrc-input"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`font-mono ${getValidationColor()} ${
            validation.isValid ? 'border-green-500 focus:border-green-600' : 
            value.trim() && !validation.isValid ? 'border-red-500 focus:border-red-600' : ''
          }`}
          maxLength={15} // DM-A0D-YY-NN-XXX = 15 chars with hyphens
        />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {!validation.isValid && (
              <Badge variant={validation.isValid ? "default" : "secondary"}>
                {validation.characterCount + 4}/12 characters
              </Badge>
            )}
            
            {validation.error && (
              <Badge variant="destructive" className="text-xs">
                {validation.error}
              </Badge>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Format Help
          </button>
        </div>
        
        {showDetails && (
          <div className="p-3 bg-muted rounded-md text-xs space-y-2">
            <div className="font-medium">ISRC Format Requirements:</div>
            <div className="space-y-1">
              <div>• DM = Dominica country code (2 chars)</div>
              <div>• A0D = Wai'tuMusic identifier (3 chars)</div>
              <div>• YY = Year (2 digits)</div>
              <div>• NN = Artist ID (2 digits)</div>
              <div>• XXX = Song number (3 digits)</div>
            </div>
            <div className="font-medium">Example: DM-A0D-25-00-001</div>
            <div className="text-muted-foreground">
              Total: 11 characters (excluding hyphens)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}