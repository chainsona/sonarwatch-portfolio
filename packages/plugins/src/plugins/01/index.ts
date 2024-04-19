import { Platform } from '@sonarwatch/portfolio-core';
import { Fetcher } from '../../Fetcher';
import { Job } from '../../Job';
import { zeroOnePlatform } from './constants';
import depositFectcher from './depostisFetcher';

export const platforms: Platform[] = [zeroOnePlatform];
export const jobs: Job[] = [];
export const fetchers: Fetcher[] = [depositFectcher];
