'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

/**
 * Header mark for the signed-in person. A photo when Auth has one,
 * otherwise initials, otherwise a user icon. The fill and glyph use
 * opposite theme colors so the mark stays readable in light and dark.
 */
export function UserAvatar({
  initial,
  imageUrl,
  className,
}: {
  initial: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const letters = initial.trim().slice(0, 2);

  return (
    <span
      className={cn(
        'bb-avatar inline-flex size-11 items-center justify-center overflow-hidden rounded-full text-[13px] font-semibold',
        className,
      )}
    >
      {showImage ? (
        // Auth avatars come from whatever host the provider used.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl ?? ''}
          alt=''
          className='size-full object-cover'
          onError={() => setImageFailed(true)}
        />
      ) : null}
      {!showImage && letters ? <span aria-hidden>{letters}</span> : null}
      {!showImage && !letters ? (
        <Icon
          name='user'
          size={18}
          aria-hidden
        />
      ) : null}
    </span>
  );
}
