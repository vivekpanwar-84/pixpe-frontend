"use client";

import { useState } from "react";
import { Loader2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageWithLoaderProps {
    src: string;
    alt: string;
    className?: string;
    showViewFull?: boolean;
    onViewFull?: () => void;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function ImageWithLoader({
    src,
    alt,
    className = "",
    showViewFull = true,
    onViewFull,
    objectFit = 'cover'
}: ImageWithLoaderProps) {
    const [isLoading, setIsLoading] = useState(true);

    const handleViewFull = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onViewFull) {
            onViewFull();
        } else {
            window.open(src, '_blank');
        }
    };

    return (
        <div className={`relative w-full h-full overflow-hidden group ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10 transition-opacity duration-300">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-${objectFit} transition-all duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} cursor-zoom-in`}
                onLoad={() => setIsLoading(false)}
                onClick={handleViewFull}
            />
            {!isLoading && showViewFull && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-semibold backdrop-blur-sm bg-white/90"
                        onClick={handleViewFull}
                    >
                        <Eye className="w-3 h-3 mr-1" /> View Full
                    </Button>
                </div>
            )}
        </div>
    );
}
