import { X } from 'lucide-react';
import { Drawer } from 'vaul';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-white">
          <div className="flex-1 overflow-hidden rounded-t-[10px] bg-black p-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FF0000]/10">
              <Drawer.Close className="text-white hover:opacity-75">
                <X className="h-6 w-6" />
              </Drawer.Close>
            </div>
            <Drawer.Title className="text-center text-white text-xl font-bold mt-2">CoreTrack Assessment Demo</Drawer.Title>
            <div className="mt-6 flex-1">
              <iframe
                className="aspect-video w-full rounded-lg"
                src="https://www.youtube.com/embed/DEMO_VIDEO_ID"
                title="CoreTrack Assessment Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="mt-4 text-center">
                <p className="text-white/80 text-sm mb-2">
                  See how CoreTrack Assessment helps SMBs find the right talent
                </p>
                <div className="flex justify-center items-center gap-4">
                  <button 
                    className="bg-[#FF0000] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#FF0000]/90 transition-colors"
                    onClick={onClose}
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}