'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MarketingSpendFormProps {
  onSuccess?: () => void;
}

export default function MarketingSpendForm({ onSuccess }: MarketingSpendFormProps) {
  const [month, setMonth] = useState('');
  const [formData, setFormData] = useState({
    facebookAds: '',
    googleAds: '',
    instagramAds: '',
    otherSpend: '',
    totalSalary: '',
  });
  const [loading, setLoading] = useState(false);
  const [totalPreview, setTotalPreview] = useState(0);

  // Auto set current month
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(currentMonth);
  }, []);

  // Live Total Preview
  useEffect(() => {
    const total = 
      Number(formData.facebookAds || 0) +
      Number(formData.googleAds || 0) +
      Number(formData.instagramAds || 0) +
      Number(formData.otherSpend || 0) +
      Number(formData.totalSalary || 0);
    setTotalPreview(total);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/meca/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          facebookAds: formData.facebookAds,
          googleAds: formData.googleAds,
          instagramAds: formData.instagramAds,
          otherSpend: formData.otherSpend,
          totalSalary: formData.totalSalary,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Investment for ${month} saved successfully!`);
        
        // Reset form
        setFormData({
          facebookAds: '', googleAds: '', instagramAds: '',
          otherSpend: '', totalSalary: ''
        });
        onSuccess?.();
      } else {
        toast.error(data.message || "Failed to save data");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Manage Monthly Investment</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Monthly Investment Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Month</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marketing Spend</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Facebook Ads (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.facebookAds}
                  onChange={(e) => setFormData({ ...formData, facebookAds: e.target.value })}
                />
              </div>
              <div>
                <Label>Google Ads (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.googleAds}
                  onChange={(e) => setFormData({ ...formData, googleAds: e.target.value })}
                />
              </div>
              <div>
                <Label>Instagram Ads (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.instagramAds}
                  onChange={(e) => setFormData({ ...formData, instagramAds: e.target.value })}
                />
              </div>
              <div>
                <Label>Other Spend (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.otherSpend}
                  onChange={(e) => setFormData({ ...formData, otherSpend: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Salary Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Total monthly salary of all employees"
                value={formData.totalSalary}
                onChange={(e) => setFormData({ ...formData, totalSalary: e.target.value })}
              />
            </CardContent>
          </Card> */}

          {/* Live Total Preview */}
          <div className="bg-muted p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Total Investment This Month</p>
            <p className="text-3xl font-bold text-green-600">₹{totalPreview.toLocaleString('en-IN')}</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Monthly Investment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}