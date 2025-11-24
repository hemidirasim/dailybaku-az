import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Parametrlər</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ümumi Parametrlər</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site-name">Sayt Adı</Label>
              <Input id="site-name" defaultValue="Daily Baku" />
            </div>
            <div>
              <Label htmlFor="site-description">Sayt Təsviri</Label>
              <Input id="site-description" defaultValue="Azərbaycan Xəbər Portalı" />
            </div>
            <Button>Yadda Saxla</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Parametrləri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input id="admin-email" type="email" />
            </div>
            <Button>Yadda Saxla</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

