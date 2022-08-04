import React from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {useSearchParams} from 'react-router-dom';
import {useNavigate} from 'react-router';
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {EntrepotUpdateStats, EntrepotAllStats} from '../utils';
import {isToniqEarnCollection} from '../location/toniq-earn-collections';
import {
  cssToReactStyleObject,
  toniqFontStyles,
  toniqColors,
  LoaderAnimated24Icon,
  Icp16Icon,
  Search24Icon,
  Filter24Icon,
  ArrowsSort24Icon,
} from '@toniq-labs/design-system';
import {NftCard} from '../components/shared/NftCard';
import {
  ToniqIcon,
  ToniqChip,
  ToniqInput,
  ToniqDropdown,
  ToniqToggleButton,
  ToniqSlider,
} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import {icpToString} from '../components/PriceICP';
import {truncateNumber} from '../truncation';
import {WithFilterPanel} from '../components/shared/WithFilterPanel';

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

function getLowestStat(stats, propKey) {
  return stats.reduce((lowest, stat) => {
    const currentValue = Number(stat.stats[propKey]);
    if (currentValue < lowest) {
      return currentValue;
    } else {
      return lowest;
    }
  }, Infinity);
}

function getHighestStat(stats, propKey) {
  return stats.reduce((lowest, stat) => {
    const currentValue = Number(stat.stats[propKey]);
    if (currentValue > lowest) {
      return currentValue;
    } else {
      return lowest;
    }
  }, -Infinity);
}

const useStyles = makeStyles(theme => ({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  collectionContainer: {
    marginBottom: 20,
    maxWidth: '100%',
  },
  root: {
    maxWidth: 345,
  },
  heading: {
    ...cssToReactStyleObject(toniqFontStyles.h1Font),
    ...cssToReactStyleObject(toniqFontStyles.extraBoldFont),
    // 8px here plus 24px padding on wrapper makes 32px total between this and the nav bar
    marginTop: '8px',
    marginBottom: '24px',
  },
  filterSortRow: {
    display: 'flex',
    justifyContent: 'space-between',
    ...cssToReactStyleObject(toniqFontStyles.boldParagraphFont),
  },
  filterAndCollectionCount: {
    display: 'flex',
    gap: '16px',
  },
  marketplaceControls: {
    marginBottom: '32px',
  },
  filterAndIcon: {
    cursor: 'pointer',
    marginLeft: '16px',
    gap: '8px',
    flexShrink: 0,
  },
  media: {
    cursor: 'pointer',
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  collectionCard: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 480,
    '@media (max-width: 400px)': {
      height: 'unset',
    },
  },
  collectionCardBottomHalf: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    alignItems: 'stretch',
  },
  collectionCardCollectionName: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignSelf: 'stretch',
    ...cssToReactStyleObject(toniqFontStyles.h3Font),
    marginBottom: 0,
    marginTop: '16px',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  },
  collectionCardBrief: {
    margin: 0,
    display: '-webkit-box',
    '-webkit-line-clamp': 3,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    textOverflow: 'clip',
    padding: '4px 0',
    ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
    color: String(toniqColors.pageSecondary.foregroundColor),
  },
  collectionCardBriefWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexBasis: 0,
    flexGrow: 1,
    minHeight: '54px',
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
  collectionDetailsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexShrink: 1,
    justifyContent: 'center',
    gap: '16px',
  },
  collectionDetailsCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'stretch',
    textAlign: 'center',
    flexBasis: '0',
    minWidth: '80px',
    flexGrow: 1,
  },
  collectionDetailsChip: {
    ...cssToReactStyleObject(toniqFontStyles.boldFont),
    ...cssToReactStyleObject(toniqFontStyles.monospaceFont),
    fontSize: '15px',
  },
}));

const defaultSortOption = {
  value: 'total_desc',
  label: 'Total Volume: High to Low',
};
const sortOptions = [
  {
    value: 'listings_asc',
    label: 'Listings: Low to High',
  },
  {
    value: 'listings_desc',
    label: 'Listings: High to Low',
  },
  defaultSortOption,
  {
    value: 'total_asc',
    label: 'Total Volume: Low to High',
  },
  {
    value: 'floor_asc',
    label: 'Floor Price: Low to High',
  },
  {
    value: 'floor_desc',
    label: 'Floor Price: High to Low',
  },
  {
    value: 'alpha_asc',
    label: 'Alphabetically: A-Z',
  },
  {
    value: 'alpha_desc',
    label: 'Alphabetically: Z-A',
  },
];

const filterTypes = {
  price: {
    floor: 'floor',
    averageSale: 'average sale',
  },
  volume: {},
};

function doesCollectionPassFilters(collectionStats, currentFilters) {
  if (!collectionStats) {
    return false;
  }

  console.log(collectionStats);

  if (currentFilters.price.range) {
    if (currentFilters.price.type === filterTypes.price.floor) {
      if (
        Number(collectionStats.stats.floor) > currentFilters.price.range.max ||
        Number(collectionStats.stats.floor) < currentFilters.price.range.min
      ) {
        return false;
      }
    } else if (currentFilters.price.type === filterTypes.price.averageSale) {
      if (
        Number(collectionStats.stats.average) > currentFilters.price.range.max ||
        Number(collectionStats.stats.average) < currentFilters.price.range.min
      ) {
        return false;
      }
    }
  }

  return true;
}

export default function Marketplace(props) {
  const navigate = useNavigate();
  const classes = useStyles();
  const [sort, setSort] = React.useState(defaultSortOption);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);
  console.log('rendering');
  const [currentFilters, setCurrentFilters] = React.useState({
    price: {
      range: undefined,
      type: 'floor',
    },
    volume: {
      range: undefined,
      type: '30-day',
    },
  });

  const query = searchParams.get('search') || '';
  const [stats, setStats] = React.useState([]);

  const _updates = () => {
    EntrepotUpdateStats().then(setStats);
  };
  React.useEffect(() => {
    if (EntrepotAllStats().length == 0) {
      _updates();
    } else {
      setStats(EntrepotAllStats());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useInterval(_updates, 60 * 1000);

  const filteredAndSortedCollections = props.collections
    .filter(collection => {
      // prevent Toniq Earn related collections from showing up in countries where its blocked
      const allowed = isToniqEarnCollection(collection) ? props.isToniqEarnAllowed : true;
      const inQuery =
        [collection.name, collection.brief, collection.keywords]
          .join(' ')
          .toLowerCase()
          .indexOf(query.toLowerCase()) >= 0;

      const currentStats = stats.find(stat => stat.canister === collection.canister);

      const passFilter = showFilters
        ? doesCollectionPassFilters(currentStats, currentFilters)
        : true;
      return allowed && passFilter && (query == '' || inQuery);
    })
    .sort((a, b) => {
      switch (sort.value) {
        case 'featured':
          return b.priority - a.priority;
          break;
        case 'listings_asc':
          if (
            stats.findIndex(x => x.canister == a.canister) < 0 &&
            stats.findIndex(x => x.canister == b.canister) < 0
          )
            return 0;
          if (stats.findIndex(x => x.canister == a.canister) < 0) return 1;
          if (stats.findIndex(x => x.canister == b.canister) < 0) return -1;
          if (
            stats.find(x => x.canister == a.canister).stats === false &&
            stats.find(x => x.canister == b.canister).stats === false
          )
            return 0;
          if (stats.find(x => x.canister == a.canister).stats === false) return 1;
          if (stats.find(x => x.canister == b.canister).stats === false) return -1;
          return (
            Number(stats.find(x => x.canister == a.canister).stats.listings) -
            Number(stats.find(x => x.canister == b.canister).stats.listings)
          );
          break;
        case 'listings_desc':
          if (
            stats.findIndex(x => x.canister == a.canister) < 0 &&
            stats.findIndex(x => x.canister == b.canister) < 0
          )
            return 0;
          if (stats.findIndex(x => x.canister == a.canister) < 0) return 1;
          if (stats.findIndex(x => x.canister == b.canister) < 0) return -1;
          if (
            stats.find(x => x.canister == a.canister).stats === false &&
            stats.find(x => x.canister == b.canister).stats === false
          )
            return 0;
          if (stats.find(x => x.canister == a.canister).stats === false) return 1;
          if (stats.find(x => x.canister == b.canister).stats === false) return -1;
          return (
            Number(stats.find(x => x.canister == b.canister).stats.listings) -
            Number(stats.find(x => x.canister == a.canister).stats.listings)
          );
          break;
        case 'total_asc':
          if (
            stats.findIndex(x => x.canister == a.canister) < 0 &&
            stats.findIndex(x => x.canister == b.canister) < 0
          )
            return 0;
          if (stats.findIndex(x => x.canister == a.canister) < 0) return 1;
          if (stats.findIndex(x => x.canister == b.canister) < 0) return -1;
          if (
            stats.find(x => x.canister == a.canister).stats === false &&
            stats.find(x => x.canister == b.canister).stats === false
          )
            return 0;
          if (stats.find(x => x.canister == a.canister).stats === false) return 1;
          if (stats.find(x => x.canister == b.canister).stats === false) return -1;
          return (
            Number(stats.find(x => x.canister == a.canister).stats.total) -
            Number(stats.find(x => x.canister == b.canister).stats.total)
          );
          break;
        case 'total_desc':
          if (
            stats.findIndex(x => x.canister == a.canister) < 0 &&
            stats.findIndex(x => x.canister == b.canister) < 0
          )
            return 0;
          if (stats.findIndex(x => x.canister == a.canister) < 0) return 1;
          if (stats.findIndex(x => x.canister == b.canister) < 0) return -1;
          if (
            stats.find(x => x.canister == a.canister).stats === false &&
            stats.find(x => x.canister == b.canister).stats === false
          )
            return 0;
          if (stats.find(x => x.canister == a.canister).stats === false) return 1;
          if (stats.find(x => x.canister == b.canister).stats === false) return -1;
          return (
            Number(stats.find(x => x.canister == b.canister).stats.total) -
            Number(stats.find(x => x.canister == a.canister).stats.total)
          );
          break;
        case 'floor_asc':
          if (
            stats.findIndex(x => x.canister == a.canister) < 0 &&
            stats.findIndex(x => x.canister == b.canister) < 0
          )
            return 0;
          if (stats.findIndex(x => x.canister == a.canister) < 0) return 1;
          if (stats.findIndex(x => x.canister == b.canister) < 0) return -1;
          if (
            stats.find(x => x.canister == a.canister).stats === false &&
            stats.find(x => x.canister == b.canister).stats === false
          )
            return 0;
          if (stats.find(x => x.canister == a.canister).stats === false) return 1;
          if (stats.find(x => x.canister == b.canister).stats === false) return -1;
          return (
            Number(stats.find(x => x.canister == a.canister).stats.floor) -
            Number(stats.find(x => x.canister == b.canister).stats.floor)
          );
          break;
        case 'floor_desc':
          if (
            stats.findIndex(x => x.canister == a.canister) < 0 &&
            stats.findIndex(x => x.canister == b.canister) < 0
          )
            return 0;
          if (stats.findIndex(x => x.canister == a.canister) < 0) return 1;
          if (stats.findIndex(x => x.canister == b.canister) < 0) return -1;
          if (
            stats.find(x => x.canister == a.canister).stats === false &&
            stats.find(x => x.canister == b.canister).stats === false
          )
            return 0;
          if (stats.find(x => x.canister == a.canister).stats === false) return 1;
          if (stats.find(x => x.canister == b.canister).stats === false) return -1;
          return (
            Number(stats.find(x => x.canister == b.canister).stats.floor) -
            Number(stats.find(x => x.canister == a.canister).stats.floor)
          );
          break;
        case 'alpha_asc':
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
          break;
        case 'alpha_desc':
          if (a.name < b.name) {
            return 1;
          }
          if (a.name > b.name) {
            return -1;
          }
          return 0;
          break;
        default:
          return 0;
      }
    });

  const priceRanges = {
    [filterTypes.price.floor]: {
      min: getLowestStat(stats, 'floor'),
      max: getHighestStat(stats, 'floor'),
    },
    [filterTypes.price.averageSale]: {
      min: getLowestStat(stats, 'average'),
      max: getHighestStat(stats, 'average'),
    },
  };

  console.log(priceRanges);

  console.log({filteredAndSortedCollections, stats});

  return (
    <>
      <div style={{width: '100%', display: 'block', position: 'relative'}}>
        <div
          style={{
            margin: '0px auto',
            minHeight: 'calc(100vh - 221px)',
          }}
        >
          <h1 className={classes.heading}>All Collections</h1>
          <ToniqInput
            style={{
              '--toniq-accent-tertiary-background-color': 'transparent',
              marginBottom: '16px',
            }}
            placeholder="Search for collections..."
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
          <WithFilterPanel
            showFilterPanel={showFilters}
            onFilterClose={() => {
              setShowFilters(false);
            }}
            filterControlChildren={
              <>
                <div>
                  <div className="title">Price</div>
                  <ToniqToggleButton
                    text="Floor"
                    active={currentFilters.price.type === filterTypes.price.floor}
                    onClick={() => {
                      setCurrentFilters({
                        ...currentFilters,
                        price: {
                          ...currentFilters.price,
                          type: filterTypes.price.floor,
                        },
                      });
                    }}
                  />
                  <ToniqToggleButton
                    text="Average Sale"
                    active={currentFilters.price.type === filterTypes.price.averageSale}
                    onClick={() => {
                      setCurrentFilters({
                        ...currentFilters,
                        price: {
                          ...currentFilters.price,
                          type: filterTypes.price.averageSale,
                        },
                      });
                    }}
                  />
                  <ToniqSlider
                    min={priceRanges[currentFilters.price.type].min}
                    max={priceRanges[currentFilters.price.type].max}
                    suffix="ICP"
                    double={true}
                    onValueChange={event => {
                      const values = event.detail;
                      setCurrentFilters({
                        ...currentFilters,
                        price: {
                          ...currentFilters.price,
                          range: values,
                        },
                      });
                    }}
                  />
                </div>
                <div>
                  <div className="title">Volume</div>
                </div>
              </>
            }
          >
            <div className={classes.marketplaceControls}>
              <div className={classes.filterSortRow}>
                <div className={classes.filterAndCollectionCount}>
                  <div
                    className={classes.filterAndIcon}
                    style={{
                      display: showFilters ? 'none' : 'flex',
                    }}
                    onClick={() => {
                      setShowFilters(true);
                    }}
                  >
                    <ToniqIcon icon={Filter24Icon} />
                    <span>Filters</span>
                  </div>
                  <span
                    style={{
                      display: showFilters ? 'none' : 'flex',
                    }}
                  >
                    •
                  </span>
                  <span
                    style={{
                      ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
                      color: toniqColors.pageSecondary.foregroundColor,
                    }}
                  >
                    {filteredAndSortedCollections.length} Collections
                  </span>
                </div>
                <ToniqDropdown
                  style={{
                    '--toniq-accent-secondary-background-color': 'transparent',
                    width: '360px',
                  }}
                  icon={ArrowsSort24Icon}
                  selectedLabelPrefix="Sort By:"
                  selected={sort}
                  onSelectChange={event => {
                    console.log(event.detail);
                    setSort(event.detail);
                  }}
                  options={sortOptions}
                />
              </div>
            </div>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="flex-start"
              spacing={4}
            >
              {filteredAndSortedCollections.map((collection, i) => {
                return (
                  <Grid key={i} item className={classes.collectionContainer}>
                    <Link
                      className={classes.collectionCard}
                      style={{textDecoration: 'none'}}
                      to={'/marketplace/' + collection.route}
                    >
                      <NftCard
                        style={{flexGrow: 1}}
                        title={collection.name}
                        imageUrl={
                          collection.hasOwnProperty('collection') && collection.collection
                            ? collection.collection
                            : '/collections/' + collection.canister + '.jpg'
                        }
                      >
                        <div className={classes.collectionCardBottomHalf}>
                          <h2 className={classes.collectionCardCollectionName}>
                            {collection.name}
                          </h2>
                          {collection.brief ? (
                            <div className={classes.collectionCardBriefWrapper}>
                              <p className={classes.collectionCardBrief}>{collection.brief}</p>
                            </div>
                          ) : (
                            ''
                          )}
                          {(() => {
                            const collectionStatsWrapper = stats.find(
                              stat => stat.canister === collection.canister,
                            );

                            if (collectionStatsWrapper) {
                              if (collectionStatsWrapper.stats) {
                                const collectionStatDetails = [
                                  {
                                    label: 'Volume',
                                    icon: Icp16Icon,
                                    value: icpToString(
                                      collectionStatsWrapper.stats.total,
                                      false,
                                      true,
                                    ),
                                  },
                                  {
                                    label: 'Listings',
                                    icon: undefined,
                                    value: truncateNumber(collectionStatsWrapper.stats.listings),
                                  },
                                  {
                                    label: 'Floor Price',
                                    icon: Icp16Icon,
                                    value: icpToString(
                                      collectionStatsWrapper.stats.floor,
                                      false,
                                      true,
                                    ),
                                  },
                                ];

                                return (
                                  <div className={classes.collectionDetailsWrapper}>
                                    {collectionStatDetails.map((cellDetails, _index, fullArray) => (
                                      <div
                                        key={cellDetails.label}
                                        style={{
                                          maxWidth: `${100 / fullArray.length}%`,
                                        }}
                                        className={classes.collectionDetailsCell}
                                      >
                                        <span
                                          style={{
                                            textTransform: 'uppercase',
                                            ...cssToReactStyleObject(toniqFontStyles.labelFont),
                                          }}
                                        >
                                          {cellDetails.label}
                                        </span>
                                        <ToniqChip
                                          className={`toniq-chip-secondary ${classes.collectionDetailsChip}`}
                                          icon={cellDetails.icon}
                                          text={cellDetails.value}
                                        ></ToniqChip>
                                      </div>
                                    ))}
                                  </div>
                                );
                              } else {
                                return '';
                              }
                            } else {
                              return (
                                <ToniqIcon
                                  style={{
                                    color: String(toniqColors.pagePrimary.foregroundColor),
                                    alignSelf: 'center',
                                  }}
                                  icon={LoaderAnimated24Icon}
                                />
                              );
                            }
                          })()}
                        </div>
                      </NftCard>
                    </Link>
                  </Grid>
                );
              })}
            </Grid>
          </WithFilterPanel>
        </div>
      </div>
    </>
  );
}
