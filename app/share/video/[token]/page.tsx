'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Lock, Play } from 'lucide-react';

interface SharedEntry {
  babyName: string;
  authorName: string;
  title: string;
  content: string;
  occurredAt: string;
  media: { url: string; type: string; thumbnailUrl: string | null }[];
}

export default function SharedVideoPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/qr/${token}`);
        if (!res.ok) {
          setError('This link is invalid or has expired.');
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError('Unable to load this memory.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="animate-pulse-soft text-muted-foreground">Loading memory...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 p-6">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-heading font-semibold mb-2">Memory Not Found</h2>
          <p className="text-muted-foreground">{error || 'This memory is private.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 p-4">
      <div className="max-w-lg mx-auto pt-8">
        <div className="text-center mb-6">
          <Heart className="w-8 h-8 text-strawberry-400 mx-auto mb-2" />
          <h1 className="font-heading text-2xl font-bold">Living Legacy</h1>
          <p className="text-sm text-muted-foreground">A precious moment from {data.babyName}&apos;s story</p>
        </div>

        <Card className="overflow-hidden">
          {data.media.map((m, i) => (
            <div key={i} className="relative">
              {m.type.startsWith('video') ? (
                <video
                  controls
                  className="w-full max-h-[60vh] bg-black"
                  poster={m.thumbnailUrl || undefined}
                >
                  <source src={m.url} type={m.type} />
                </video>
              ) : (
                <img src={m.url} alt="" className="w-full max-h-[60vh] object-cover" />
              )}
            </div>
          ))}
          <CardContent className="p-6">
            {data.title && (
              <h2 className="font-heading text-xl font-semibold mb-2">{data.title}</h2>
            )}
            {data.content && (
              <p className="text-muted-foreground mb-3">{data.content}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Shared by {data.authorName}</span>
              <span>{new Date(data.occurredAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          This is a private family memory shared with you via Living Legacy.
        </p>
      </div>
    </div>
  );
}
