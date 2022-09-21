import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import extjs from "../ic/extjs.js";
import getNri from "../ic/nftv.js";
import orderBy from "lodash.orderby";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { icpToString } from './PriceICP';
import {css} from 'element-vir';
import CollectionDetails from './CollectionDetails';
import { EntrepotUpdateStats, EntrepotAllStats, EntrepotCollectionStats, EntrepotNFTImage, EntrepotNFTMintNumber, EntrepotGetICPUSD } from '../utils';
import {redirectIfBlockedFromEarnFeatures} from '../location/redirect-from-marketplace';
import { StyledTab, StyledTabs } from "./shared/PageTab.js";
import { WithFilterPanel } from "./shared/WithFilterPanel.js";
import {
  ToniqInput,
  ToniqDropdown,
  ToniqMiddleEllipsis,
  ToniqIcon
} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import { useSearchParams } from "react-router-dom";
import { ArrowsSort24Icon, cssToReactStyleObject, LoaderAnimated24Icon, Search24Icon, toniqColors, toniqFontStyles } from "@toniq-labs/design-system";
import { Loading } from "./shared/Loading.js";
import { NftCard } from "./shared/NftCard.js";
import { getEXTCanister } from "../utilities/load-tokens.js";
import PriceUSD from "./PriceUSD.js";
import Timestamp from "react-timestamp";
import { NoResult } from "./shared/NoResult.js";

function useInterval(callback, delay) {
  const savedCallback = React.useRef();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const _isCanister = c => {
  return c.length === 27 && c.split("-").length === 5;
};

const useStyles = makeStyles(theme => ({
  listRowContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    maxWidth: '100%',
    backgroundColor: 'white',
    paddingBottom: '32px',
    marginTop: '32px',
    [theme.breakpoints.down("sm")]: {
      marginTop: '16px',
		},
  },
  listRowHeader: {
    display: 'flex',
    backgroundColor: toniqColors.accentSecondary.backgroundColor,
    borderRadius: '8px',
    padding: '0 16px',
  }
}));

const defaultSortOption = {
  value: {
    type: 'price',
    sort: 'asc',
  },
  label: 'Price: Low to High',
};

const sortOptions = [
  {
    value: {
      type: 'mintNumber',
      sort: 'asc',
    },
    label: 'Mint #: Low to High',
  },
  {
    value: {
      type: 'mintNumber',
      sort: 'desc',
    },
    label: 'Mint #: High to Low',
  },
  {
    value: {
      type: 'rarity',
      sort: 'asc',
    },
    label: 'Rarity: Low to High',
  },
  {
    value: {
      type: 'rarity',
      sort: 'desc',
    },
    label: 'Rarity: High to Low',
  },
  defaultSortOption,
  {
    value: {
      type: 'price',
      sort: 'desc',
    },
    label: 'Price: High to Low',
  },
];

function ListRow({items, style}) {
  return (
    <div
      className="profile-list-view-nft-details-row"
      style={{
        display: 'flex',
        gap: '16px',
        maxHeight: '64px',
        alignItems: 'center',
        flexGrow: 1,
        ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
        ...style,
      }}
    >
      {items[0] ? (
        <div
          style={{
            flexBasis: '48px',
            flexShrink: 0,
          }}
        >
          &nbsp;
        </div>
      ) : (
        ''
      )}
      <div
        style={{
          flexBasis: 0,
          marginLeft: '32px',
          flexGrow: 1,
          maxWidth: '72px',
        }}
      >
        {items[1]}
      </div>
      <div
        style={{
          flexGrow: 1,
          flexBasis: 0,
          maxWidth: '78px',
        }}
      >
        {items[2]}
      </div>
      <div
        style={{
          flexGrow: 1,
          flexBasis: 0,
          maxWidth: '180px',
        }}
      >
        {items[3]}
      </div>
      <div
        style={{
          flexGrow: 1,
          flexBasis: 0,
          maxWidth: '185px',
        }}
      >
        {items[4]}
      </div>
      <div
        style={{
          flexGrow: 1,
          flexBasis: 0,
        }}
      >
        {items[5]}
      </div>
      {items[6]}
    </div>
  );
}

export default function Activity(props) {
  const params = useParams();
  const classes = useStyles();
  const getCollectionFromRoute = r => {
    if (_isCanister(r)) {
      return props.collections.find(e => e.canister === r)
    } else {
      return props.collections.find(e => e.route === r)
    };
  };
  const [stats, setStats] = React.useState(false);
  const [listings, setListings] = useState(false);
  const [collection] = useState(getCollectionFromRoute(params?.route, props.collections));
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const [sort, setSort] = useState(defaultSortOption);
  
  const navigate = useNavigate();
  
  redirectIfBlockedFromEarnFeatures(navigate, collection, props);

  const _updates = async () => {
    await refresh();
  };

  const refresh = async (canister) => {
    canister = canister ?? collection?.canister;

    EntrepotUpdateStats().then(() => {
      setStats(EntrepotCollectionStats(collection.canister))
    }); 

    try {
      var result = await fetch("https://us-central1-entrepot-api.cloudfunctions.net/api/canister/"+ canister +"/transactions").then(r => r.json());
      var listings = result
        .map((e) => {
          const { index, canister} = extjs.decodeTokenId(e.token);
          const rarity = Number((getNri(canister, index) * 100).toFixed(1));
          const mintNumber = EntrepotNFTMintNumber(canister, index);

          return {
            ...e,
            image: EntrepotNFTImage(getEXTCanister(canister), index, e.token, false, 0),
            rarity,
            mintNumber,
          };
        });

      setListings(listings);
    } catch(error) {
      console.error(error);
    };
  };

  const filteredStatusListings = listings ? listings
    .filter((listing, listingIndex) => listings.findIndex(list => list.id === listing.id) === listingIndex)
    .filter(listing => listing.token !== '') : [];

  const filteredAndSortedListings = orderBy(
    filteredStatusListings.filter((listing) => {
      const inQuery =
        [listing.tokenid, listing.mintNumber]
          .join(' ')
          .toLowerCase()
          .indexOf(query.toLowerCase()) >= 0;
      return (query === '' || inQuery);
    }),
    [sort.value.type],
    [sort.value.sort]
  );

  useInterval(_updates, 60 * 1000);
  
  React.useEffect(() => {
    if (EntrepotAllStats().length) setStats(EntrepotCollectionStats(collection.canister));
    _updates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div style={{ minHeight:"calc(100vh - 221px)"}}>
      <div style={{maxWidth:1320, margin:"0 auto 0"}}>
        <CollectionDetails stats={stats} collection={collection} />
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
        <StyledTabs
          value={"activity"}
          indicatorColor="primary"
          textColor="primary"
          onChange={(e, tab) => {
            if (tab === "nfts") navigate(`/marketplace/${collection?.route}/`)
          }}
        >
          <StyledTab value="nfts" label="NFTs" />
          <StyledTab value="activity" label="Activity" />
        </StyledTabs>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ToniqInput
            value={query}
            style={{
              '--toniq-accent-tertiary-background-color': 'transparent',
              maxWidth: '300px',
              boxSizing: 'border-box',
              flexGrow: '1',
              marginLeft: '-16px',
            }}
            placeholder="Search for mint # or token ID"
            icon={Search24Icon}
            onValueChange={event => {
              const search = event.detail;
              if (search) {
                setSearchParams({search});
              } else {
                setSearchParams({});
              }
            }}
          />
        </div>
        <WithFilterPanel
        noFilters={true}
          otherControlsChildren={
            <>
              <span
                style={{
                  display: 'flex',
                  ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
                  color: toniqColors.pageSecondary.foregroundColor,
                }}
              >
                NFTs&nbsp;{listings ? `(${filteredAndSortedListings.length})` : <ToniqIcon icon={LoaderAnimated24Icon} />}
              </span>
              <ToniqDropdown
                style={{
                  display: 'flex',
                  '--toniq-accent-secondary-background-color': 'transparent',
                  width: '360px',
                }}
                icon={ArrowsSort24Icon}
                selectedLabelPrefix="Sort By:"
                selected={sort}
                onSelectChange={event => {
                  setSort(event.detail);
                }}
                options={sortOptions}
              />
            </>
          }
        >
          {
            filteredAndSortedListings.length ?
            <div className={classes.listRowContainer}>
              <div className={classes.listRowHeader}>
                <ListRow
                  items={[true, 'MINT #', 'NRI', 'PRICE', 'FROM', 'TO', 'TIME']}
                  style={{
                    ...cssToReactStyleObject(toniqFontStyles.labelFont),
                    maxHeight: '32px',
                  }}
                />
              </div>
              {filteredAndSortedListings.map(listing => {
                return (
                  <NftCard
                    listStyle={true}
                    onClick={() => {
                      navigate(`/marketplace/asset/${listing.token}`);
                    }}
                    imageUrl={listing.image}
                    key={listing.id}
                  >
                    <>
                      <style
                        dangerouslySetInnerHTML={{
                          __html: String(css`
                            .profile-list-view-nft-details-row > span {
                            }
                          `),
                        }}
                      ></style>
                      <ListRow
                        items={[
                          '',
                          `#${listing.mintNumber}`,
                          `${listing.rarity}%`,
                          <>
                            {icpToString(listing.price, true, true)}&nbsp;ICP&nbsp;(<PriceUSD price={EntrepotGetICPUSD(listing.price)} />)
                          </>,
                          <>
                            <ToniqMiddleEllipsis externalLink={`https://icscan.io/account/${listing.seller}`} letterCount={5} text={listing.seller} />
                          </>,
                          <>
                            <ToniqMiddleEllipsis externalLink={`https://icscan.io/account/${listing.buyer}`} letterCount={5} text={listing.buyer} />
                          </>,
                          <Timestamp
                            relative
                            autoUpdate
                            date={Number(listing.time / 1000000000)}
                            style={{...cssToReactStyleObject(toniqFontStyles.boldParagraphFont)}}
                          />
                        ]}
                      />
                    </>
                  </NftCard>
                );
              })}
            </div> : ''
          }
          <NoResult noResult={listings && !filteredAndSortedListings.length} />
          <Loading loading={!listings} />
        </WithFilterPanel>
      </div>
    </div>
  );
}
