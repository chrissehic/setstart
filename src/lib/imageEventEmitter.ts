type ImageUpdateEvent = {
  workflowId: string;
  field: string;
  imageUrl: string | null;
};

type ImageUpdateListener = (event: ImageUpdateEvent) => void;

class ImageEventEmitter {
  private listeners: ImageUpdateListener[] = [];

  subscribe(listener: ImageUpdateListener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(event: ImageUpdateEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const imageEventEmitter = new ImageEventEmitter();
