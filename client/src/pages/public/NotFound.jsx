import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-16 flex items-center justify-center min-h-[60vh]">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you requested does not exist or may have been moved."
        action={
          <Link to="/">
            <Button variant="primary">Return to homepage</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
