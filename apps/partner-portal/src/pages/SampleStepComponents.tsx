import { Card } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group';
import { Checkbox } from '@repo/ui/components/ui/checkbox';
import { User, Building, MapPin, CreditCard, FileText, Shield, Award, CheckCircle } from 'lucide-react';

// Business-oriented step content for the enhanced multi-step layout

export const BasicDetailsStep1 = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <User className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Individual Information</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name*</Label>
        <Input id="name" placeholder="Enter full name" defaultValue="Saravanan" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email*</Label>
        <Input id="email" type="email" placeholder="Enter email address" defaultValue="sam13223@gmail.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile*</Label>
        <Input id="mobile" placeholder="Enter mobile number" defaultValue="9992299921" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth*</Label>
        <Input id="dob" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender*</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Residence Address*</Label>
        <Input id="address" placeholder="Enter Address" />
      </div>
    </div>
  </div>
);

export const BasicDetailsStep2 = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <MapPin className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Location Details</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="pincode">Residence Pincode*</Label>
        <Input id="pincode" placeholder="Enter Pincode" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="area">Area</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="area1">Area 1</SelectItem>
            <SelectItem value="area2">Area 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="district">District</Label>
        <Input id="district" placeholder="Enter District" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Input id="state" placeholder="Enter State" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pan">PAN Number*</Label>
        <Input id="pan" placeholder="Enter PAN No." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="aadhar">Aadhar Number*</Label>
        <Input id="aadhar" placeholder="Enter Aadhar No." />
      </div>
    </div>
  </div>
);

export const DataCaptureStep1 = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <Building className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Business Information</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name*</Label>
        <Input id="businessName" placeholder="Enter business name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type*</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sole">Sole Proprietorship</SelectItem>
            <SelectItem value="partnership">Partnership</SelectItem>
            <SelectItem value="company">Private Limited Company</SelectItem>
            <SelectItem value="llp">LLP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gstin">GSTIN</Label>
        <Input id="gstin" placeholder="Enter GSTIN" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="turnover">Annual Turnover*</Label>
        <Input id="turnover" placeholder="Enter annual turnover" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="businessAddress">Business Address*</Label>
        <Textarea id="businessAddress" placeholder="Enter complete business address" />
      </div>
    </div>
  </div>
);

export const DataCaptureStep2 = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <CreditCard className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Financial Information</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name*</Label>
        <Input id="bankName" placeholder="Enter bank name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number*</Label>
        <Input id="accountNumber" placeholder="Enter account number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ifsc">IFSC Code*</Label>
        <Input id="ifsc" placeholder="Enter IFSC code" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountType">Account Type*</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="current">Current</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export const KYCStep1 = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <FileText className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Document Upload</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 border-dashed border-2 border-border">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Aadhar Card</h4>
          <p className="text-sm text-muted-foreground mb-4">Upload front and back images</p>
          <input type="file" multiple className="hidden" id="aadhar-upload" />
          <Label htmlFor="aadhar-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90">
            Choose Files
          </Label>
        </div>
      </Card>
      
      <Card className="p-6 border-dashed border-2 border-border">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">PAN Card</h4>
          <p className="text-sm text-muted-foreground mb-4">Upload PAN card image</p>
          <input type="file" className="hidden" id="pan-upload" />
          <Label htmlFor="pan-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90">
            Choose File
          </Label>
        </div>
      </Card>
      
      <Card className="p-6 border-dashed border-2 border-border">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Bank Statement</h4>
          <p className="text-sm text-muted-foreground mb-4">Last 6 months statement</p>
          <input type="file" className="hidden" id="bank-upload" />
          <Label htmlFor="bank-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90">
            Choose File
          </Label>
        </div>
      </Card>
      
      <Card className="p-6 border-dashed border-2 border-border">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Business Proof</h4>
          <p className="text-sm text-muted-foreground mb-4">Registration certificate</p>
          <input type="file" className="hidden" id="business-upload" />
          <Label htmlFor="business-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90">
            Choose File
          </Label>
        </div>
      </Card>
    </div>
  </div>
);

export const BranchRecommendationStep = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <Award className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Branch Recommendation</h3>
    </div>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">Recommended Branch</Label>
        <RadioGroup defaultValue="branch1">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="branch1" id="branch1" />
                <div className="flex-1">
                  <Label htmlFor="branch1" className="cursor-pointer">
                    <div className="font-medium">Mumbai Central Branch</div>
                    <div className="text-sm text-muted-foreground">
                      123 Business District, Mumbai - 400001 | Distance: 2.5 km
                    </div>
                  </Label>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">95% Match</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="branch2" id="branch2" />
                <div className="flex-1">
                  <Label htmlFor="branch2" className="cursor-pointer">
                    <div className="font-medium">Andheri East Branch</div>
                    <div className="text-sm text-muted-foreground">
                      456 Commercial Complex, Andheri East - 400069 | Distance: 5.2 km
                    </div>
                  </Label>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">87% Match</div>
                </div>
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">Additional Requirements</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="priority" />
            <Label htmlFor="priority" className="cursor-pointer">Priority processing required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dedicated" />
            <Label htmlFor="dedicated" className="cursor-pointer">Dedicated relationship manager</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="doorstep" />
            <Label htmlFor="doorstep" className="cursor-pointer">Doorstep banking services</Label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const HQApprovalStep = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <CheckCircle className="w-6 h-6 text-primary" />
      <h3 className="text-xl font-semibold text-foreground">Final Review & Approval</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 bg-gradient-accent border-border/50">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Application Summary
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Applicant:</span>
            <span className="text-foreground">Saravanan</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Journey Type:</span>
            <span className="text-foreground">Full Fledged Partner</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Application ID:</span>
            <span className="text-foreground">#LND2024001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted Date:</span>
            <span className="text-foreground">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-accent border-border/50">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Verification Status
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Personal Details:</span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">KYC Documents:</span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Financial Info:</span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Branch Assignment:</span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Completed
            </span>
          </div>
        </div>
      </Card>
    </div>
    
    <Card className="p-6 bg-gradient-accent border-border/50">
      <h4 className="font-semibold text-foreground mb-4">Terms & Conditions</h4>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox id="terms1" />
          <Label htmlFor="terms1" className="cursor-pointer text-sm">
            I acknowledge that all information provided is accurate and complete to the best of my knowledge.
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="terms2" />
          <Label htmlFor="terms2" className="cursor-pointer text-sm">
            I agree to the partner terms and conditions and privacy policy.
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="terms3" />
          <Label htmlFor="terms3" className="cursor-pointer text-sm">
            I consent to background verification and credit checks as required.
          </Label>
        </div>
      </div>
    </Card>
    
    <div className="text-center pt-4">
      <p className="text-muted-foreground text-sm mb-4">
        Your application will be reviewed by our team within 2-3 business days.
      </p>
      <div className="inline-flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        Ready for HQ approval
      </div>
    </div>
  </div>
);