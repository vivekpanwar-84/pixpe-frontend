import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";

interface ImageWithSkeletonProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    priority?: boolean;
}

export function ImageWithSkeleton({
    src,
    alt,
    className,
    containerClassName,
    priority = false,
}: ImageWithSkeletonProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {!isLoaded && !hasError && (
                <Skeleton className="absolute inset-0 w-full h-full bg-gray-200" />
            )}
            <div className={cn(
                "w-full h-full transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0"
            )}>
                <Image
                    src={hasError ? "/placeholder-image.png" : src}
                    alt={alt}
                    fill
                    priority={priority}
                    className={cn("object-cover", className)}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
        </div>
    );
}
