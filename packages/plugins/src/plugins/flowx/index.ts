import { Platform } from '@sonarwatch/portfolio-core';
import { Fetcher } from '../../Fetcher';
import { Job } from '../../Job';
import { platform } from './constants';
import stakingFetcher from './stakingFetcher';
import pairsJob from './pairsJob';
import poolFetcher from './poolFetcher';
import poolsJob from './poolsJob';

export const platforms: Platform[] = [platform];
export const jobs: Job[] = [pairsJob, poolsJob];
export const fetchers: Fetcher[] = [stakingFetcher, poolFetcher];
