'use client';

import { useState } from 'react';
import { toast } from "sonner";
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function OrganicLeadForm({ onLeadAdded }: { onLeadAdded?: () => void }) {
  const [formData, setFormData] = useState({
    eqName: '',
    contact: '',
    city: '',
    state: '',
    address: '',
    email: '',
    software: '',
    admissionStatus: '',
    fee: '',
    preDemoDate: '',
    demoDate: '',
    salesDeck: 'No',
    reminder: 'No',
    sourceReference: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Photo ${file.name} is larger than 2MB`);
        return;
      }
      newPhotos.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setPhotos(prev => [...prev, ...newPhotos]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
// ==================== BEST POSSIBLE OCR PARSING FOR YOUR FORM ====================
const processOCR = async (file: File) => {
  setIsProcessingOCR(true);
  toast.info("Reading handwriting with AI...");

  try {
    // Convert image file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        mediaType: file.type, // e.g. "image/jpeg"
      }),
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || 'OCR failed');
    }

    const extracted = result.data;
    console.log('Extracted data:', extracted);

    setFormData(prev => ({
      ...prev,
      eqName:          extracted.eqName          || prev.eqName,
      contact:         extracted.contact         || prev.contact,
      email:           extracted.email           || prev.email,
      city:            extracted.city            || prev.city,
      state:           extracted.state           || prev.state,
      address:         extracted.address         || prev.address,
      software:        extracted.software        || prev.software,
      admissionStatus: extracted.admissionStatus || prev.admissionStatus,
      fee:             extracted.fee             || prev.fee,
      preDemoDate:     extracted.preDemoDate     || prev.preDemoDate,
      demoDate:        extracted.demoDate        || prev.demoDate,
    }));

    toast.success("Form auto-filled from handwriting!");

  } catch (error) {
    console.error("OCR error:", error);
    toast.error("Could not read the image. Please fill manually.");
  } finally {
    setIsProcessingOCR(false);
  }
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') submitData.append(key, value);
    });

    photos.forEach(photo => submitData.append('photo', photo));

    try {
      const res = await fetch('/api/leads/organic', {
        method: 'POST',
        body: submitData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Organic Lead added successfully!");
        
        setFormData({
          eqName: '', contact: '', city: '', state: '', address: '', email: '',
          software: '', admissionStatus: '', fee: '', preDemoDate: '', 
          demoDate: '', salesDeck: 'No', reminder: 'No', sourceReference: ''
        });
        setPhotos([]);
        setPreviews([]);
        onLeadAdded?.();
      } else {
        toast.error(data.message || "Failed to add lead");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Organic Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="md:col-span-2">
            <Label>Enquiry Name <span className="text-red-500">*</span></Label>
            <Input name="eqName" value={formData.eqName} onChange={handleChange} required />
          </div>

          <div>
            <Label>Contact Number <span className="text-red-500">*</span></Label>
            <Input name="contact" type="tel" value={formData.contact} onChange={handleChange} required />
          </div>

          <div>
            <Label>Email</Label>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <Label>City</Label>
            <Input name="city" value={formData.city} onChange={handleChange} />
          </div>

          <div>
            <Label>State</Label>
            <Input name="state" value={formData.state} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input name="address" value={formData.address} onChange={handleChange} />
          </div>

          <div>
            <Label>Software <span className="text-red-500">*</span></Label>
            <Select onValueChange={(v) => handleSelectChange('software', v)} value={formData.software}>
              <SelectTrigger>
                <SelectValue placeholder="Select Software" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="ML">Machine Learning</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Admission Status (Optional)</Label>
            <Select onValueChange={(v) => handleSelectChange('admissionStatus', v)} value={formData.admissionStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Admission Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admitted">Admitted</SelectItem>
                <SelectItem value="Not Admitted">Not Admitted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fee (₹) <span className="text-red-500">*</span></Label>
            <Input type="number" name="fee" value={formData.fee} onChange={handleChange} placeholder="Enter course fee" required />
          </div>

          <div>
            <Label>Pre-Demo Date</Label>
            <Input type="date" name="preDemoDate" value={formData.preDemoDate} onChange={handleChange} />
          </div>

          <div>
            <Label>Demo Date</Label>
            <Input type="date" name="demoDate" value={formData.demoDate} onChange={handleChange} />
          </div>

          <div>
            <Label>Sales Deck</Label>
            <Select onValueChange={(v) => handleSelectChange('salesDeck', v)} value={formData.salesDeck}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Reminder</Label>
            <Select onValueChange={(v) => handleSelectChange('reminder', v)} value={formData.reminder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Source Reference <span className="text-red-500">*</span></Label>
            <Select onValueChange={(v) => handleSelectChange('sourceReference', v)} value={formData.sourceReference} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload with OCR */}
          <div className="md:col-span-2">
            <Label>Upload Admission Form Photo (Auto Fill)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
              <label className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-400" size={40} />
                <p className="text-sm text-gray-500">Click to upload photos</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`preview-${index}`} className="h-24 w-full object-cover rounded-lg border" />
                    <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      className="absolute bottom-1 left-1 text-xs opacity-0 group-hover:opacity-100"
                      onClick={() => processOCR(photos[index])}
                      disabled={isProcessingOCR}
                    >
                      {isProcessingOCR ? <Loader2 className="animate-spin h-3 w-3" /> : "Auto Fill"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 pt-4">
            <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
              {loading ? "Adding Lead..." : "Add Organic Lead"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}