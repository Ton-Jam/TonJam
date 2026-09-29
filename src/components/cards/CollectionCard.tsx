import React from 'react';
import { useNavigate } from 'react-router-dom';
import MediaCard from '@/components/common/MediaCard';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';

interface CollectionCardProps {
  id?: string;
  name: string;
  itemCount: string | number;
  coverUrl: string;
  className?: string;
  onClick?: () => void;
}

export const CollectionCard = ({ id = "genesis-pass", name, itemCount, coverUrl, className, onClick }: CollectionCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/collections/${id}`);
    }
  };

  return (
    <MediaCard
      type="collection"
      className={className}
      onClick={handleClick}
      artwork={
        <LazyArtworkImage
          src={coverUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      }
      title={name}
      subtitle={`${itemCount} items`}
    />
  );
};

export default CollectionCard;
