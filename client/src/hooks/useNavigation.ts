import { useLocation } from 'wouter';

export function useNavigation() {
  const [location, setLocation] = useLocation();

  const navigate = (path: string) => {
    setLocation(path);
  };

  return { navigate, location };
}