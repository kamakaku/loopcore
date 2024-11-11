interface TeamInfoProps {
  memberCount: number;
  projectCount: number;
  loopCount: number;
  description?: string;
}

export default function TeamInfo({
  memberCount,
  projectCount,
  loopCount,
  description
}: TeamInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Members</h3>
          <p className="text-sm text-gray-900">{memberCount} members</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Projects</h3>
          <p className="text-sm text-gray-900">{projectCount} projects</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Loops</h3>
          <p className="text-sm text-gray-900">{loopCount} loops</p>
        </div>
      </div>
      {description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
          <p className="text-sm text-gray-900">{description}</p>
        </div>
      )}
    </div>
  );
}