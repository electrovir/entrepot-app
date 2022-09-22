import React, { useEffect, useState } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import getGenes from "./CronicStats.js";
import extjs from "../ic/extjs.js";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import CollectionDetails from './CollectionDetails';
import { EntrepotUpdateStats, EntrepotAllStats, EntrepotCollectionStats, EntrepotNFTMintNumber, EntrepotNFTImage, EntrepotGetAllLiked } from '../utils';
import {redirectIfBlockedFromEarnFeatures} from '../location/redirect-from-marketplace';
import { StyledTab, StyledTabs } from "./shared/PageTab.js";
import { WithFilterPanel } from "./shared/WithFilterPanel.js";
import {
  cssToReactStyleObject,
  toniqFontStyles,
  toniqColors,
  Search24Icon,
  ArrowsSort24Icon,
  LayoutGrid24Icon,
  GridDots24Icon,
  LoaderAnimated24Icon,
} from '@toniq-labs/design-system';
import {
  ToniqInput,
  ToniqDropdown,
  ToniqToggleButton,
  ToniqSlider,
  ToniqCheckbox,
  ToniqIcon,
  ToniqButton,
} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import { Link, useSearchParams } from "react-router-dom";
import getNri from "../ic/nftv.js";
import orderBy from "lodash.orderby";
import LazyLoad from 'react-lazyload';
import { getEXTCanister, getEXTID } from "../utilities/load-tokens.js";
import { Accordion } from "./Accordion.js";
import { NftCard } from "./shared/NftCard.js";
import PriceICP from "./PriceICP.js";
import { uppercaseFirstLetterOfWord } from "../utilities/string-utils.js";
import { cronicFilterTraits } from "../model/constants.js";
import { isInRange } from "../utilities/number-utils.js";
import { MinimumOffer } from "./shared/MinimumOffer.js";
import { Loading } from "./shared/Loading.js";
import Favourite from "./Favourite.js";
import { NoResult } from "./shared/NoResult.js";
const api = extjs.connect("https://boundary.ic0.app/");

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

const useDidMountEffect = (func, deps) => {
    const didMount = React.useRef(false);

    useEffect(() => {
        if (didMount.current) func();
        else didMount.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

const _isCanister = c => {
  return c.length === 27 && c.split("-").length === 5;
};

const useStyles = makeStyles(theme => ({
  traitCategoryWrapper: {
    ...cssToReactStyleObject(toniqFontStyles.boldParagraphFont),
    "& input": {
      display: "none",
      "&:checked + label > .traitCategoryCounter": {
        backgroundColor: "#00D093",
        color: "#FFFFFF"
      },
      "&:checked ~ .traitsAccordion": {
        maxHeight: "3000px",
        overflow: "visible",
      },
    }
  },
  traitCategory: {
    display: "flex",
    justifyContent: "space-between",
  },
  traitCategoryCounter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: "16px",
    backgroundColor: "#F1F3F6",
    ...cssToReactStyleObject(toniqFontStyles.boldLabelFont)
  },
  traitsWrapper: {
    display: "grid",
    gap: "16px",
  },
  traitsContainer: {
    display: "grid",
    gap: "32px",
    margin: "32px 0px",
    [theme.breakpoints.down("sm")]: {
      gap: "16px",
      margin: "16px 0px",
		},
  },
  traitsAccordion: {
    maxHeight: "0",
    transition: "max-height 0.4s cubic-bezier(0.29, -0.01, 0, 0.94)",
    overflow: "hidden",
  },
  gridControl: {
    cursor: "pointer",
  },
  cronicTraitsContainer: {
    padding: "16px",
    "& toniq-slider": {
      margin: '0 !important'
    }
  },
  nftCard: {
    position: 'relative',
    "&:hover .offerChipContainer": {
      display: "flex",
    }
  },
  nftWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    [theme.breakpoints.down("md")]: {
      justifyContent: "center"
		},
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
  defaultSortOption,
  {
    value: {
      type: 'price',
      sort: 'desc',
    },
    label: 'Price: High to Low',
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
];

const filterTypes = {
  status: {
    forSale: "forSale",
    entireCollection: "entireCollection",
  },
  price: 'price',
  rarity: 'rarity',
  mintNumber: 'mintNumber',
  traits: 'traits',
};

function doesCollectionPassFilters(listing, currentFilters, traitsData, collection) {
  if (!listing) {
    return false;
  }
  if (currentFilters.price.range) {
    if (
      Number(listing.price) / 100000000 > currentFilters.price.range.max ||
      Number(listing.price) / 100000000 < currentFilters.price.range.min
    ) {
      return false;
    }
  }

  if (currentFilters.rarity.range) {
    if (
      listing.rarity > currentFilters.rarity.range.max ||
      listing.rarity < currentFilters.rarity.range.min
    ) {
      return false;
    }
  }

  if (currentFilters.mintNumber.range) {
    if (
      Number(listing.mintNumber) > currentFilters.mintNumber.range.max ||
      Number(listing.mintNumber) < currentFilters.mintNumber.range.min
    ) {
      return false;
    }
  }

  if (currentFilters.traits.values.length) {
    return currentFilters.traits.values.reduce((currentCategory, category) => {
      const categoryIndex = listing.traits.findIndex((listingTrait) => {
        return listingTrait.category === category.category;
      })

      const trait = category.values.reduce((currentTrait, trait) => {
        return currentTrait || trait === listing.traits[categoryIndex].value
      }, false);

      return currentCategory && trait;
    }, true);
  }

  if (!traitsData && collection?.route === 'cronics') {
    return cronicFilterTraits.reduce((currentCategory, category) => {
      return currentCategory && 
      isInRange(listing.traits[category].dominant, currentFilters.traits.values[category].dominant.min, currentFilters.traits.values[category].dominant.max) &&
      isInRange(listing.traits[category].recessive, currentFilters.traits.values[category].recessive.min, currentFilters.traits.values[category].recessive.max) 
    }, true);
  }

  return true;
}

function getCronicFilters() {
  var filters = {};
  cronicFilterTraits.forEach(trait => {
    const range = {min: 0, max: 63}
    filters[trait] = {
      dominant: range,
      recessive: range,
    };
  });
  return filters;
}

export default function Listings(props) {
  const params = useParams();
  const classes = useStyles();
  const getCollectionFromRoute = r => {
    if (_isCanister(r)) {
      return props.collections.find(e => e.canister === r)
    } else {
      return props.collections.find(e => e.route === r)
    };
  };
  const [stats, setStats] = useState(false);
  const [listings, setListings] = useState(false);
  const [traitsData, setTraitsData] = useState(false);
  const [traitsCategories, setTraitsCategories] = useState([]);
  const [collection] = useState(getCollectionFromRoute(params?.route));
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const queryTrait = searchParams.get('searchTrait') || '';
  const [sort, setSort] = useState(defaultSortOption);
  const [gridSize, setGridSize] = useState('large');
  const [currentFilters, setCurrentFilters] = useState({
    status: {
      range: undefined,
      type: 'forSale',
    },
    price: {
      range: undefined,
      type: 'price',
    },
    rarity: {
      range: undefined,
      type: 'rarity',
    },
    mintNumber: {
      range: undefined,
      type: 'mintNumber',
    },
    traits: {
      values: !traitsData && collection?.route === 'cronics' ? getCronicFilters() : [],
      type: 'traits',
    }
  });

  const navigate = useNavigate();
  
  redirectIfBlockedFromEarnFeatures(navigate, collection, props);

  const loadTraits = async () => {
    if (collection?.filter) {
      try {
        return await fetch("/filter/" + collection?.canister + ".json").then(
          (response) => response.json()
        );
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  };
  
  const _updates = async (s, canister) => {
    canister = canister ?? collection?.canister;

    EntrepotUpdateStats().then(() => {
      setStats(EntrepotCollectionStats(canister))
    });

    try {
      var result = await api.token(canister).listings();
      let traitsCategories;
      if (traitsData) {
        traitsCategories = traitsData[0].map((trait) => {
          return {
            category: trait[1],
            values: trait[2].map((trait) => {
              return trait[1];
            })
          };
        })
        setTraitsCategories(traitsCategories);
      } else if (collection?.route === "cronics") {
        traitsCategories = cronicFilterTraits.map((trait) => {
          return {
            category: trait
          }
        })
        setTraitsCategories(traitsCategories);
      }

      var listings = result
        .map((listing, listingIndex) => {
          const tokenid = extjs.encodeTokenId(collection?.canister, listing[0]);
          const { index, canister} = extjs.decodeTokenId(tokenid);
          const rarity = Number((getNri(canister, index) * 100).toFixed(1));
          const mintNumber = EntrepotNFTMintNumber(canister, index);
          let traits;
          if (traitsData) {
            traits = traitsData[1][listingIndex][1].map((trait) => {
              const traitCategory = trait[0];
              const traitValue = trait[1];
              return {
                category: traitsCategories[traitCategory].category,
                value: traitsCategories[traitCategory].values[traitValue],
              }
            })
          } else if (!traitsData && collection?.route === 'cronics') {
            traits = getGenes(listing[2].nonfungible.metadata[0]).battle;
          }

          return {
            ...listing,
            image: EntrepotNFTImage(getEXTCanister(canister), index, tokenid, false, 0),
            price: listing[1].price,
            rarity,
            mintNumber,
            tokenid,
            index,
            canister,
            traits
          }
        });

      setListings(listings);
    } catch(error) {
      console.error(error);
    };
  };

  const filteredStatusListings = listings ? listings
    .filter(listing => (listing[1] === false || listing.price >= 1000000n))
    .filter(listing => {
      return currentFilters.status.type === filterTypes.status.forSale ? listing[1] : true;
    }) : [];

  const lowestPrice = filteredStatusListings.reduce((lowest, listing) => {
    const currentValue = Number(listing.price) / 100000000;
    if (currentValue < lowest) {
      return currentValue;
    } else {
      return lowest;
    }
  }, Infinity);

  const highestPrice = filteredStatusListings.reduce((highest, listing) => {
    const currentValue = Number(listing.price) / 100000000;
    if (currentValue > highest) {
      return currentValue;
    } else {
      return highest;
    }
  }, -Infinity);

  const lowestMint = filteredStatusListings.reduce((lowest, listing) => {
    const currentValue = EntrepotNFTMintNumber(listing?.canister, listing?.index);
    if (currentValue < lowest) {
      return currentValue;
    } else {
      return lowest;
    }
  }, Infinity);

  const highestMint = filteredStatusListings.reduce((highest, listing) => {
    const currentValue = EntrepotNFTMintNumber(listing?.canister, listing?.index);
    if (currentValue > highest) {
      return currentValue;
    } else {
      return highest;
    }
  }, -Infinity);

  const filterRanges = {
    [filterTypes.price]: {
      min: lowestPrice,
      max: highestPrice,
    },
    [filterTypes.rarity]: {
      min: 0,
      max: 100,
    },
    [filterTypes.mintNumber]: {
      min: lowestMint,
      max: highestMint,
    },
    [filterTypes.traits]: {
      min: 0,
      max: 63,
    },
  };

  const filteredAndSortedListings = orderBy(
    filteredStatusListings.filter((listing) => {
      const inQuery =
        [listing.tokenid, listing.mintNumber]
          .join(' ')
          .toLowerCase()
          .indexOf(query.toLowerCase()) >= 0;
      const passFilter = showFilters
        ? doesCollectionPassFilters(listing, currentFilters, traitsData, collection)
        : true;
      return passFilter && (query === '' || inQuery);
    }),
    [sort.value.type],
    [sort.value.sort]
  );

  const queryFilteredTraits = (traitsCategoryValues) => {
    return traitsCategoryValues.filter((trait) => {
      const inQuery = trait
        .toString()
        .toLowerCase()
        .indexOf(queryTrait.toLowerCase()) >= 0;
      return (queryTrait === '' || inQuery);
    })
  }

  useInterval(_updates, 10 * 1000);

  useEffect(() => {
    if (EntrepotAllStats().length) setStats(EntrepotCollectionStats(collection.canister));
    loadTraits().then(traits => {
      if (traits) {        
        setTraitsData(traits);
      } else {
        _updates();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidMountEffect(() => {
    _updates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traitsData]);

  return (
    <div style={{ minHeight:"calc(100vh - 221px)"}}>
      <div style={{maxWidth:1320, margin:"0 auto 0"}}>
        <CollectionDetails stats={stats} collection={collection} />
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
        <StyledTabs
          value={"nfts"}
          indicatorColor="primary"
          textColor="primary"
          onChange={(e, tab) => {
            if (tab === "activity") navigate(`/marketplace/${collection?.route}/activity`)
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
          <div style={{ display: "flex", gap: "8px" }}>
            <ToniqIcon
              icon={LayoutGrid24Icon}
              onClick={() => {
                setGridSize('large')
              }}
              style={{ color: gridSize === 'large' ? '#000000': 'gray' }}
              className={classes.gridControl}
            />
            <ToniqIcon
              icon={GridDots24Icon}
              onClick={() => {
                setGridSize('small')
              }}
              style={{ color: gridSize !== 'large' ? '#000000': 'gray' }}
              className={classes.gridControl}
            />
          </div>
        </div>
        <WithFilterPanel
          showFilters={showFilters}
          onShowFiltersChange={newShowFilters => {
            if (listings) setShowFilters(newShowFilters);
          }}
          onFilterClose={() => {
            setShowFilters(false);
          }}
          filterControlChildren={
            <>
              <div>
                <Accordion title="Status" open={true}>
                  <div style={{ margin: "32px 0" }}>
                    <ToniqToggleButton
                      text="For Sale"
                      active={currentFilters.status.type === filterTypes.status.forSale}
                      onClick={() => {
                        setCurrentFilters({
                          ...currentFilters,
                          status: {
                            ...currentFilters.status,
                            type: filterTypes.status.forSale,
                          },
                        });
                      }}
                    />
                    <ToniqToggleButton
                      text="Entire Collection"
                      active={currentFilters.status.type === filterTypes.status.entireCollection}
                      onClick={() => {
                        setCurrentFilters({
                          ...currentFilters,
                          status: {
                            ...currentFilters.status,
                            type: filterTypes.status.entireCollection,
                          },
                        });
                      }}
                    />
                  </div>
                </Accordion>
              </div>
              <div>
                <Accordion title="Price" open={true}>
                  <div style={{ margin: "32px 0" }}>
                    <ToniqSlider
                      logScale={true}
                      min={filterRanges[currentFilters.price.type].min}
                      max={filterRanges[currentFilters.price.type].max}
                      suffix="ICP"
                      double={true}
                      value={currentFilters.price.range || filterRanges[currentFilters.price]}
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
                </Accordion>
              </div>
              <div>
                <Accordion title="Rarity" open={true}>
                  <div style={{ margin: "32px 0" }}>
                    <ToniqSlider
                      logScale={true}
                      min={filterRanges[currentFilters.rarity.type].min}
                      max={filterRanges[currentFilters.rarity.type].max}
                      suffix="%"
                      double={true}
                      value={currentFilters.rarity.range || filterRanges[currentFilters.rarity.type]}
                      onValueChange={event => {
                        const values = event.detail;
                        setCurrentFilters({
                          ...currentFilters,
                          rarity: {
                            ...currentFilters.rarity,
                            range: values,
                          },
                        });
                      }}
                    />
                    </div>
                  </Accordion>
              </div>
              <div>
                <Accordion title="Mint #" open={true}>
                  <div style={{ margin: "32px 0" }}>
                    <ToniqSlider
                      logScale={true}
                      min={filterRanges[currentFilters.mintNumber.type].min}
                      max={filterRanges[currentFilters.mintNumber.type].max}
                      double={true}
                      value={currentFilters.mintNumber.range || filterRanges[currentFilters.mintNumber.type]}
                      onValueChange={event => {
                        const values = event.detail;
                        setCurrentFilters({
                          ...currentFilters,
                          mintNumber: {
                            ...currentFilters.mintNumber,
                            range: values,
                          },
                        });
                      }}
                    />
                  </div>
                </Accordion>
              </div>
              <div>
                <Accordion title={`Traits (${traitsCategories.length})`} open={true}>
                  <Grid container spacing={2} style={{ margin: collection?.route === 'cronics' ? "16px 0" : "32px 0" }}>
                    {collection?.route === 'cronics' ? 
                      <>
                        {traitsCategories.map((traitsCategory, index) => {
                          return (
                            <Grid key={index} item xs={12} className={classes.traitCategoryWrapper}>
                              <Accordion
                                title={uppercaseFirstLetterOfWord(traitsCategory.category)}
                                open={false}
                              >
                                <div className={classes.cronicTraitsContainer}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                      <span>Dominant: </span>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <ToniqSlider
                                        min={filterRanges[currentFilters.traits.type].min}
                                        max={filterRanges[currentFilters.traits.type].max}
                                        double={true}
                                        value={currentFilters.traits.values[traitsCategory.category].dominant || filterRanges[currentFilters.traits.type]}
                                        onValueChange={event => {
                                          const values = event.detail;
                                          setCurrentFilters({
                                            ...currentFilters,
                                            traits: {
                                              ...currentFilters.traits,
                                              values: {
                                                ...currentFilters.traits.values,
                                                [traitsCategory.category]: {
                                                  ...currentFilters.traits.values[traitsCategory.category],
                                                  dominant: values,
                                                },
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </Grid>
                                  </Grid>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                      <span>Recessive: </span>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <ToniqSlider
                                        min={filterRanges[currentFilters.traits.type].min}
                                        max={filterRanges[currentFilters.traits.type].max}
                                        double={true}
                                        value={currentFilters.traits.values[traitsCategory.category].recessive || filterRanges[currentFilters.traits.type]}
                                        onValueChange={event => {
                                          const values = event.detail;
                                          setCurrentFilters({
                                            ...currentFilters,
                                            traits: {
                                              ...currentFilters.traits,
                                              values: {
                                                ...currentFilters.traits.values,
                                                [traitsCategory.category]: {
                                                  ...currentFilters.traits.values[traitsCategory.category],
                                                  recessive: values,
                                                },
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </Grid>
                                  </Grid>
                                </div>
                              </Accordion>
                            </Grid>
                          )
                        })}
                      </> :
                      <>
                        {traitsCategories.map((traitsCategory, index) => {
                          return (
                            <Grid key={index} item xs={12} className={classes.traitCategoryWrapper}>
                              <input
                                id={traitsCategory.category}
                                type="checkbox"
                              />
                              <label htmlFor={traitsCategory.category} className={classes.traitCategory}>
                                <span>{traitsCategory.category}</span>
                                {traitsCategory.values ? <span className={`${classes.traitCategoryCounter} traitCategoryCounter`}>{traitsCategory.values.length}</span> : ''}
                              </label>
                              <div className={`${classes.traitsAccordion} traitsAccordion`}>
                                <div className={classes.traitsContainer}>
                                  {
                                    traitsCategory.values && traitsCategory.values.length > 10 ? 
                                    <ToniqInput
                                      value={queryTrait}
                                      style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                      }}
                                      placeholder="Search..."
                                      icon={Search24Icon}
                                      onValueChange={event => {
                                        const searchTrait = event.detail;
                                        if (searchTrait) {
                                          setSearchParams({searchTrait});
                                        } else {
                                          setSearchParams({});
                                        }
                                      }}
                                    /> : ""
                                  }
                                  <div className={classes.traitsWrapper}>
                                    {
                                      traitsCategory.values &&
                                      queryFilteredTraits(traitsCategory.values)
                                        .map((trait) => {
                                          return (
                                            <ToniqCheckbox
                                              key={`${trait}-${index}`}
                                              text={trait}
                                              onCheckedChange={event => {
                                                const traitIndex = currentFilters.traits.values.findIndex((trait) => {
                                                  return trait.category === traitsCategory.category;
                                                })
                                                if (event.detail) {
                                                  if (traitIndex !== -1) {
                                                    if (!currentFilters.traits.values[traitIndex].values.includes(trait)) currentFilters.traits.values[traitIndex].values.push(trait);
                                                  } else {
                                                    currentFilters.traits.values.push({
                                                      category: traitsCategory.category,
                                                      values: [trait],
                                                    });
                                                  }
                                                } else {
                                                  if (traitIndex !== -1) {
                                                    const valueIndex = currentFilters.traits.values[traitIndex].values.findIndex((value) => {
                                                      return value === trait;
                                                    })
                                                    
                                                    if (currentFilters.traits.values[traitIndex].values.length !== 1) {
                                                      currentFilters.traits.values[traitIndex].values.splice(valueIndex, 1);
                                                    } else {
                                                      currentFilters.traits.values.splice(traitIndex, 1)
                                                    }
                                                  }
                                                }
                                                setCurrentFilters({
                                                  ...currentFilters,
                                                  traits: {
                                                    ...currentFilters.traits,
                                                    values: currentFilters.traits.values,
                                                  },
                                                });
                                              }}
                                            />
                                          )
                                        })
                                    }
                                    {
                                      traitsCategory.values &&
                                      !queryFilteredTraits(traitsCategory.values).length && 
                                      <div style={{ display: 'flex', justifyContent: 'center', ...cssToReactStyleObject(toniqFontStyles.paragraphFont), opacity: 0.64 }}>
                                        <span>No Result</span>
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </Grid>
                          )
                        })}
                      </>
                    }
                  </Grid>
                </Accordion>
              </div>
            </>
          }
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
              <Grid container spacing={4} className={classes.nftWrapper}>
                {filteredAndSortedListings.map((listing, index) => {
                  return (
                    <Grid key={index} item>
                      <LazyLoad offset={-150} once>
                        <Link to={`/marketplace/asset/` + getEXTID(listing.tokenid)} style={{ textDecoration: "none" }}>
                          <NftCard 
                            imageUrl={listing.image} 
                            key={listing.tokenid} 
                            small={gridSize === 'small'} 
                            className={classes.nftCard}
                            style={{ maxWidth: gridSize === 'small' ? '192px' : '304px', maxHeight: gridSize === 'small' ? '192px' : '416px' }}
                          >
                            {
                              gridSize === 'large' ? 
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <span
                                  style={{
                                    marginBottom: '16px',
                                    marginTop: '16px',
                                    ...cssToReactStyleObject(toniqFontStyles.h3Font),
                                  }}
                                >
                                  <span style={cssToReactStyleObject(toniqFontStyles.h3Font)}>
                                    {
                                      listing.price ? <PriceICP large={true} volume={true} clean={false} size={20} price={listing.price} /> : 'Unlisted'
                                    }
                                  </span>
                                </span>
                                <div style={{display: 'flex'}}>
                                  <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column',}}>
                                    <span style={cssToReactStyleObject(toniqFontStyles.boldParagraphFont)}>
                                      #{listing.mintNumber || ''}
                                    </span>
                                    <span style={{...cssToReactStyleObject(toniqFontStyles.labelFont), opacity: "0.64"}}>
                                      NRI: {listing.rarity || '0'}%
                                    </span>
                                  </div>
                                  {
                                    listing.price ? 
                                    <ToniqButton
                                      text="Buy Now"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        props.buyNft(listing.canister, listing.index, listing, _updates)
                                      }}
                                    /> : ''
                                  }
                                </div>
                              </div> : ''
                            }
                            <MinimumOffer tokenid={listing.tokenid} gridSize={gridSize} />
                            <div
                              style={{ position: "absolute", top: "24px", left: "24px" }}
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              <Favourite 
                                refresher={props.faveRefresher} 
                                identity={props.identity} 
                                loggedIn={props.loggedIn} 
                                tokenid={listing.tokenid} 
                              />
                            </div>
                          </NftCard>
                        </Link>
                      </LazyLoad>
                    </Grid>
                  );
                })}
              </Grid> : ''
          }
          <NoResult noResult={listings && !filteredAndSortedListings.length} />
          <Loading loading={!listings} />
        </WithFilterPanel>
      </div>
    </div>
  );
}
