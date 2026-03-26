import { useRouter } from 'expo-router';

type ReviewTarget = {
  id: string;
};

export function useOpenReviewViewer() {
  const router = useRouter();

  return (target: ReviewTarget) => {
    router.push({
      pathname: '/review/[id]',
      params: { id: target.id },
    });
  };
}
