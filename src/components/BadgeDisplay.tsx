import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { Badge, BadgeInfo, getBadgeInfo } from '../services/blessingService';

interface BadgeDisplayProps {
  badges: Badge[];
  onClaimBadge?: (badge: Badge) => void;
  isOwnProfile?: boolean;
}

export default function BadgeDisplay({ badges, onClaimBadge, isOwnProfile = false }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <div className="bg-dark-lighter rounded-xl p-8 border border-dark-border">
        <div className="text-center">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Badges Yet</h3>
          <p className="text-gray-400">
            {isOwnProfile
              ? 'Earn badges by getting blessings on your revivals!'
              : 'This user hasn\'t earned any badges yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-lighter rounded-xl p-6 border border-dark-border">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Award className="w-6 h-6 text-primary" />
        NFT Badges
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const badgeInfo = getBadgeInfo(badge.badge_type);
          if (!badgeInfo) return null;

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              badgeInfo={badgeInfo}
              onClaim={onClaimBadge}
              isOwnProfile={isOwnProfile}
            />
          );
        })}
      </div>
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
  badgeInfo: BadgeInfo;
  onClaim?: (badge: Badge) => void;
  isOwnProfile: boolean;
}

function BadgeCard({ badge, badgeInfo, onClaim, isOwnProfile }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl p-6 border-2 ${
        badge.claimed
          ? 'bg-gradient-to-br ' + badgeInfo.color + ' border-transparent'
          : 'bg-dark-card border-primary border-dashed'
      } transition-all duration-300 hover:scale-105`}
    >
      {!badge.claimed && (
        <div className="absolute top-2 right-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-dark rounded-full animate-pulse">
            NEW
          </span>
        </div>
      )}

      <div className="text-center">
        <div className="text-4xl mb-3">{badgeInfo.icon}</div>

        <h4 className="text-lg font-bold text-white mb-2">
          {badgeInfo.name}
        </h4>

        <p className="text-sm text-gray-300 mb-4">
          {badgeInfo.description}
        </p>

        {badge.claimed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-300">
              <span className="font-mono">#{badge.token_id}</span>
            </div>
            {badge.tx_hash && (
              <a
                href={`https://sepolia.scrollscan.com/tx/${badge.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          isOwnProfile && onClaim && (
            <button
              onClick={() => onClaim(badge)}
              className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              Claim NFT Badge
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
