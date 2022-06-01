import { act, render, waitFor } from '@testing-library/react';
import React, { Suspense, version as ReactVersion } from 'react';

import { createSearchClient } from '../../../../../test/mock';
import { wait } from '../../../../../test/utils';
import { useRefinementList } from '../../connectors/useRefinementList';
import { useSearchBox } from '../../connectors/useSearchBox';
import { IndexContext } from '../../lib/IndexContext';
import { InstantSearchContext } from '../../lib/InstantSearchContext';
import version from '../../version';
import { Index } from '../Index';
import { InstantSearch } from '../InstantSearch';

import type { UseRefinementListProps } from '../../connectors/useRefinementList';
import type { InstantSearch as InstantSearchType } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

function SearchBox() {
  useSearchBox();
  return null;
}

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}

describe('InstantSearch', () => {
  test('renders children', () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        Children
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        Children
      </div>
    `);
  });

  test('provides the search instance', () => {
    const searchClient = createSearchClient({});
    let searchContext: InstantSearchType | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <InstantSearchContext.Consumer>
          {(context) => {
            searchContext = context;
            return null;
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );

    expect(searchContext).toEqual(
      expect.objectContaining({
        start: expect.any(Function),
        dispose: expect.any(Function),
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
  });

  test('provides the main index', () => {
    const searchClient = createSearchClient({});
    let indexContext: IndexWidget | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <IndexContext.Consumer>
          {(context) => {
            indexContext = context;
            return null;
          }}
        </IndexContext.Consumer>
      </InstantSearch>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
  });

  test('attaches users agents', () => {
    const searchClient = createSearchClient({});

    render(<InstantSearch indexName="indexName" searchClient={searchClient} />);

    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react (${ReactVersion})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch (${version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch-hooks (${version})`
    );
  });

  test('starts the search on mount', () => {
    const searchClient = createSearchClient({});
    let searchContext: InstantSearchType | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <InstantSearchContext.Consumer>
          {(context) => {
            searchContext = context;
            return null;
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );

    expect(searchContext!.started).toEqual(true);
  });

  test('disposes the search on unmount', () => {
    const searchClient = createSearchClient({});
    let searchContext: InstantSearchType | null = null;

    const { unmount } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <InstantSearchContext.Consumer>
          {(context) => {
            searchContext = context;
            return null;
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );

    unmount();

    expect(searchContext!.started).toEqual(false);
  });

  test('triggers a single network request on mount with widgets', async () => {
    const searchClient = createSearchClient({});

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <SearchBox />
        <Index indexName="subIndexName">
          <RefinementList attribute="brand" />
        </Index>
      </InstantSearch>
    );

    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(1);
  });

  test('renders components in Strict Mode', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <React.StrictMode>
          <InstantSearch indexName="indexName" searchClient={searchClient}>
            <SearchBox />
            <Index indexName="subIndexName">
              <RefinementList attribute="brand" />
            </Index>
          </InstantSearch>
        </React.StrictMode>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: { facets: [], query: '', tagFilters: '' },
        },
        {
          indexName: 'subIndexName',
          params: {
            facets: ['brand'],
            maxValuesPerFacet: 10,
            query: '',
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('renders components in Strict Mode with a Suspense boundary', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <React.StrictMode>
          <InstantSearch indexName="indexName" searchClient={searchClient}>
            <SearchBox />
            <Suspense fallback={null}>
              <Index indexName="subIndexName">
                <RefinementList attribute="brand" />
              </Index>
            </Suspense>
          </InstantSearch>
        </React.StrictMode>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: { facets: [], query: '', tagFilters: '' },
        },
        {
          indexName: 'subIndexName',
          params: {
            facets: ['brand'],
            maxValuesPerFacet: 10,
            query: '',
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('renders components with a Suspense boundary', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <SearchBox />
          <Suspense fallback={null}>
            <Index indexName="subIndexName">
              <RefinementList attribute="brand" />
            </Index>
          </Suspense>
        </InstantSearch>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: { facets: [], query: '', tagFilters: '' },
        },
        {
          indexName: 'subIndexName',
          params: {
            facets: ['brand'],
            maxValuesPerFacet: 10,
            query: '',
            tagFilters: '',
          },
        },
      ]);
    });
  });
});
