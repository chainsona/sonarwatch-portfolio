import { StorageValue } from 'unstorage';
import { Cache, TransactionOptions } from '../../Cache';

const defaultMemoizedRefreshInterval = 600;

// T is the type of stored item in cache
// K is the type of the item after transformation
export class Memoized<T> {
  private readonly fetch: () => Promise<T>;
  private readonly ttl: number;

  private item: T | undefined;
  private lastUpdate: number;

  constructor(
    fetch: () => Promise<T>,
    ttl: number = defaultMemoizedRefreshInterval
  ) {
    this.fetch = fetch;
    this.ttl = ttl;
    this.lastUpdate = 0;
  }

  getItem = async () => {
    const now = Date.now();

    if (!this.item || this.lastUpdate + this.ttl < now) {
      this.item = await this.fetch();
      this.lastUpdate = now;
    }

    return this.item;
  };
}
