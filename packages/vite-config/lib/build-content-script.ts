import { withPageConfig } from './index.js';
import { IS_DEV } from '@extension/env';
import { makeEntryPointPlugin } from '@extension/hmr';
import { build } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

interface IContentBuilderProps {
  matchesDir: string;
  srcDir: string;
  rootDir: string;
  contentName: 'content' | 'content-ui' | 'content-runtime';
}

type BuilderPropsType = IContentBuilderProps;

const getContentScriptEntries = (matchesDir: string) => {
  const entryPoints: Record<string, string> = {};
  const entries = readdirSync(matchesDir);

  entries.forEach((folder: string) => {
    const filePath = resolve(matchesDir, folder);
    const isFolder = statSync(filePath).isDirectory();
    const haveIndexTsFile = readdirSync(filePath).includes('config.ts');
    const haveIndexTsxFile = readdirSync(filePath).includes('index.tsx');

    if (isFolder && !(haveIndexTsFile || haveIndexTsxFile)) {
      throw new Error(`${folder} in \`matches\` doesn't have index.ts or index.tsx file`);
    } else {
      entryPoints[folder] = resolve(filePath, haveIndexTsFile ? 'config.ts' : 'index.tsx');
    }
  });

  return entryPoints;
};

const configsBuilder = ({ matchesDir, srcDir, rootDir, contentName }: BuilderPropsType) =>
  Object.entries(getContentScriptEntries(matchesDir)).map(([name, entry]) => ({
    name,
    config: withPageConfig({
      mode: IS_DEV ? 'development' : undefined,
      resolve: {
        alias: {
          '@src': srcDir,
        },
      },
      publicDir: resolve(rootDir, 'public'),
      plugins: [IS_DEV && makeEntryPointPlugin()],
      build: {
        lib: {
          name: name,
          formats: ['iife'],
          entry,
          fileName: name,
        },
        outDir: resolve(rootDir, '..', '..', 'dist', contentName),
      },
    }),
  }));

const builds = async ({ srcDir, contentName, rootDir, matchesDir }: IContentBuilderProps) =>
  configsBuilder({ matchesDir, srcDir, rootDir, contentName }).map(async ({ config }) => {
    //@ts-expect-error This is hidden property from vite's resolveConfig()
    config.configFile = false;
    return build(config);
  });

// FIXME: USE THIS FOR ALL CONTENT SCRIPTs
export const contentBuilder = async ({ matchesDir, srcDir, rootDir, contentName }: IContentBuilderProps) =>
  builds({
    srcDir,
    contentName,
    rootDir,
    matchesDir,
  });
