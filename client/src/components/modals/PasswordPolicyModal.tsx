import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useModalManager } from '@/hooks/useModalManager';
import { 
  Shield, 
  Lock, 
  Clock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Key,
  Timer,
  Users
} from "lucide-react";

interface PasswordPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PasswordPolicyModal({ open, onOpenChange }: PasswordPolicyModalProps) {
  const { toast } = useToast();
  
  const [policySettings, setPolicySettings] = useState({
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUserInfo: true,
    passwordHistory: 5,
    maxAge: 90,
    lockoutThreshold: 5,
    lockoutDuration: 30,
    sessionTimeout: 24,
    twoFactorRequired: false,
    passwordComplexityScore: 3
  });

  const [testPassword, setTestPassword] = useState("");
  const [showTestPassword, setShowTestPassword] = useState(false);

  const handleSavePolicy = () => {
    // Simulate API call to save password policy
    toast({
      title: "Password Policy Updated",
      description: "New password policy has been applied to all users.",
    });
    onOpenChange(false);
  };

  const validateTestPassword = (password: string) => {
    const checks = {
      length: password.length >= policySettings.minLength && password.length <= policySettings.maxLength,
      uppercase: !policySettings.requireUppercase || /[A-Z]/.test(password),
      lowercase: !policySettings.requireLowercase || /[a-z]/.test(password),
      numbers: !policySettings.requireNumbers || /\d/.test(password),
      special: !policySettings.requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password),
      common: !policySettings.preventCommonPasswords || !['password', '123456', 'admin'].includes(password.toLowerCase())
    };
    
    return checks;
  };

  const passwordChecks = validateTestPassword(testPassword);
  const isValidPassword = Object.values(passwordChecks).every(check => check);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Password Policy Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Policy Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={policySettings.minLength}
                      onChange={(e) => setPolicySettings(prev => ({
                        ...prev,
                        minLength: parseInt(e.target.value) || 8
                      }))}
                      min="4"
                      max="32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLength">Maximum Length</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={policySettings.maxLength}
                      onChange={(e) => setPolicySettings(prev => ({
                        ...prev,
                        maxLength: parseInt(e.target.value) || 128
                      }))}
                      min="8"
                      max="256"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="uppercase">Require Uppercase Letters</Label>
                    <Switch
                      id="uppercase"
                      checked={policySettings.requireUppercase}
                      onCheckedChange={(checked) => setPolicySettings(prev => ({
                        ...prev,
                        requireUppercase: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowercase">Require Lowercase Letters</Label>
                    <Switch
                      id="lowercase"
                      checked={policySettings.requireLowercase}
                      onCheckedChange={(checked) => setPolicySettings(prev => ({
                        ...prev,
                        requireLowercase: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="numbers">Require Numbers</Label>
                    <Switch
                      id="numbers"
                      checked={policySettings.requireNumbers}
                      onCheckedChange={(checked) => setPolicySettings(prev => ({
                        ...prev,
                        requireNumbers: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="special">Require Special Characters</Label>
                    <Switch
                      id="special"
                      checked={policySettings.requireSpecialChars}
                      onCheckedChange={(checked) => setPolicySettings(prev => ({
                        ...prev,
                        requireSpecialChars: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="passwordHistory">Password History (prevent reuse)</Label>
                  <Input
                    id="passwordHistory"
                    type="number"
                    value={policySettings.passwordHistory}
                    onChange={(e) => setPolicySettings(prev => ({
                      ...prev,
                      passwordHistory: parseInt(e.target.value) || 5
                    }))}
                    min="0"
                    max="24"
                  />
                </div>
                <div>
                  <Label htmlFor="maxAge">Password Expiry (days)</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={policySettings.maxAge}
                    onChange={(e) => setPolicySettings(prev => ({
                      ...prev,
                      maxAge: parseInt(e.target.value) || 90
                    }))}
                    min="30"
                    max="365"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="commonPasswords">Prevent Common Passwords</Label>
                  <Switch
                    id="commonPasswords"
                    checked={policySettings.preventCommonPasswords}
                    onCheckedChange={(checked) => setPolicySettings(prev => ({
                      ...prev,
                      preventCommonPasswords: checked
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="userInfo">Prevent User Info in Password</Label>
                  <Switch
                    id="userInfo"
                    checked={policySettings.preventUserInfo}
                    onCheckedChange={(checked) => setPolicySettings(prev => ({
                      ...prev,
                      preventUserInfo: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testing & Security Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Tester
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testPassword">Test Password</Label>
                  <div className="relative">
                    <Input
                      id="testPassword"
                      type={showTestPassword ? "text" : "password"}
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Enter password to test against policy"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowTestPassword(!showTestPassword)}
                    >
                      {showTestPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {testPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Validation</span>
                      <Badge variant={isValidPassword ? "default" : "destructive"}>
                        {isValidPassword ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {passwordChecks.length ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Length ({policySettings.minLength}-{policySettings.maxLength} characters)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.uppercase ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Uppercase letters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.lowercase ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Lowercase letters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.numbers ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Numbers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.special ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Special characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.common ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Not a common password</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lockoutThreshold">Failed Login Attempts</Label>
                  <Input
                    id="lockoutThreshold"
                    type="number"
                    value={policySettings.lockoutThreshold}
                    onChange={(e) => setPolicySettings(prev => ({
                      ...prev,
                      lockoutThreshold: parseInt(e.target.value) || 5
                    }))}
                    min="3"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={policySettings.lockoutDuration}
                    onChange={(e) => setPolicySettings(prev => ({
                      ...prev,
                      lockoutDuration: parseInt(e.target.value) || 30
                    }))}
                    min="5"
                    max="120"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={policySettings.sessionTimeout}
                    onChange={(e) => setPolicySettings(prev => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value) || 24
                    }))}
                    min="1"
                    max="72"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                  <Switch
                    id="twoFactor"
                    checked={policySettings.twoFactorRequired}
                    onCheckedChange={(checked) => setPolicySettings(prev => ({
                      ...prev,
                      twoFactorRequired: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Impact Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>18 users will need to update passwords</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Enhanced security for all accounts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Policy applies immediately after save</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Policy changes will affect all existing and new users
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} className="bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Save Policy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}