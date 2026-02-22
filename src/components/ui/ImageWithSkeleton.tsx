"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

export function ImageWithSkeleton({
    src,
    alt,
    className,
    containerClassName,
    ...props
}: ImageWithSkeletonProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={cn("relative w-full h-full", containerClassName)}>
            {!isLoaded && !hasError && (
                <Skeleton className="absolute inset-0 w-full h-full bg-gray-200" />
            )}
            <img
                src={hasError ? "/placeholder-image.png" : src}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                {...props}
            />
        </div>
    );
}
