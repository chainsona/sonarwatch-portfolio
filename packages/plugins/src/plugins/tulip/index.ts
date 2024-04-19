import { Platform } from '@sonarwatch/portfolio-core';
import { Fetcher } from '../../Fetcher';
import { Job } from '../../Job';
import { tulipPlatform } from './constants';
import strategyTokensJob from './strategyTokensJob';
import lendingTokensJob from './lendingTokensJob';
import depositsFetcher from './depositsFetcher';

export const platforms: Platform[] = [tulipPlatform];
export const jobs: Job[] = [strategyTokensJob, lendingTokensJob];
export const fetchers: Fetcher[] = [depositsFetcher];
