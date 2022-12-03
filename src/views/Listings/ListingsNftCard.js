import chunk from 'lodash.chunk';
import {
    gridLargeMaxHeight,
    gridLargeMaxWidth,
    gridSmallMaxHeight,
    gridSmallMaxWidth,
} from '../../model/constants';
import {NftCardPlaceholder} from '../../shared/NftCardPlaceholder';
import LazyLoad from 'react-lazyload';
import {makeStyles} from '@material-ui/core';
import {
    ArrowsSortAscending24Icon,
    ArrowsSortDescending24Icon,
    cssToReactStyleObject,
    LoaderAnimated24Icon,
    toniqColors,
    toniqFontStyles,
    X24Icon,
} from '@toniq-labs/design-system';
import {getEXTCanister, getEXTID} from '../../utilities/load-tokens';
import {Link} from 'react-router-dom';
import {NftCard} from '../../shared/NftCard';
import {EntrepotNFTImage} from '../../utils';
import PriceICP from '../../components/PriceICP';
import {
    ToniqButton,
    ToniqDropdown,
    ToniqIcon,
} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import {MinimumOffer} from '../../components/shared/MinimumOffer';
import Favourite from '../../components/Favourite';
import {StateContainer} from '../../components/shared/StateContainer';

const useStyles = makeStyles(theme => ({
    nftCard: {
        position: 'relative',
        '&:hover .hoverCard': {
            display: 'flex',
        },
        '&:hover $favourite': {
            display: 'block',
        },
    },
    favourite: {
        display: 'none',
        [theme.breakpoints.down('xs')]: {
            display: 'block',
        },
    },
    listingContainer: {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${gridLargeMaxWidth})`,
        justifyContent: 'center',
        gap: 32,
        [theme.breakpoints.down('xs')]: {
            gap: 16,
        },
        '&.small': {
            gridTemplateColumns: `repeat(auto-fill, ${gridSmallMaxWidth})`,
        },
    },
    toggleSort: {
        background: 'none',
        padding: 0,
        margin: 0,
        border: 'none',
        font: 'inherit',
        cursor: 'pointer',
        textTransform: 'inherit',
        textDecoration: 'inherit',
        '-webkit-tap-highlight-color': 'transparent',
        ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
        '&:hover': {
            color: toniqColors.pageInteractionHover.foregroundColor,
        },
    },
    sortWrapper: {
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    mobileControlWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    desktopControlWrapper: {
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
        ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
        fontWeight: 500,
    },
    tokenWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    token: {
        display: 'flex',
        borderRadius: 8,
        padding: '10px 12px',
        gap: 12,
        ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
        fontWeight: 500,
        background: toniqColors.accentSecondary.backgroundColor,
        color: toniqColors.accentSecondary.foregroundColor,
    },
    tokenCloseIcon: {
        cursor: 'pointer',
        '&:hover': {
            color: toniqColors.pageInteractionHover.foregroundColor,
        },
    },
    clearToken: {
        background: 'none',
        padding: 0,
        margin: 0,
        border: 'none',
        font: 'inherit',
        cursor: 'pointer',
        textTransform: 'inherit',
        textDecoration: 'inherit',
        '-webkit-tap-highlight-color': 'transparent',
        '&:hover': {
            color: toniqColors.pageInteractionHover.foregroundColor,
        },
    },
}));

export function ListingsNftCard(props) {
    const {buyNft, faveRefresher, identity, loggedIn} = props;
    const {
        gridSize,
        filteredAndSortedListings,
        hasListing,
        pageListing,
        _updates,
        listings,
        loadingRef,
        showFilters,
        sort,
        setSort,
        storeUserPreferences,
        forceCheck,
        sortOptions,
        hasRarity,
        sortType,
        setSortType,
    } = props;
    const classes = useStyles();
    const preloaderItemColor = '#f1f1f1';

    const chunkedAndFilteredAndSortedListings = chunk(
        filteredAndSortedListings,
        gridSize === 'small' ? 24 : 12,
    );

    const hasListed = () => {
        hasListing.current = true;
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        const listingPage = sessionStorage.getItem('listingPage');
        if (
            scrollPosition &&
            listings &&
            getShowListings(chunkedAndFilteredAndSortedListings).length
        ) {
            pageListing.current = Number(listingPage);
            setTimeout(() => {
                window.scrollTo(0, parseInt(scrollPosition));
                sessionStorage.removeItem('scrollPosition');
                sessionStorage.removeItem('listingPage');
            }, 250);
        }
    };

    const getShowListings = listings => {
        const showListings = listings.reduce((current, listing, index) => {
            if (index <= pageListing.current) {
                return current.concat(listing);
            } else {
                return current;
            }
        }, []);

        return listings.length ? showListings : [];
    };
    return (
        <div style={{position: 'relative'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
                {showFilters && (
                    <div className={classes.desktopControlWrapper}>
                        <span
                            style={{
                                display: 'flex',
                                ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
                                color: toniqColors.pageSecondary.foregroundColor,
                            }}
                        >
                            NFTs&nbsp;{listings ? `(${filteredAndSortedListings.length})` : ''}
                        </span>
                        <div className={classes.tokenWrapper}>
                            <div className={classes.tokenWrapper}>
                                <div className={classes.token}>
                                    <span>Test 1</span>
                                    <ToniqIcon className={classes.tokenCloseIcon} icon={X24Icon} />
                                </div>
                                <div className={classes.token}>
                                    <span>Test 2</span>
                                    <ToniqIcon className={classes.tokenCloseIcon} icon={X24Icon} />
                                </div>
                                <div className={classes.token}>
                                    <span>Test 3</span>
                                    <ToniqIcon className={classes.tokenCloseIcon} icon={X24Icon} />
                                </div>
                            </div>
                            <button className={classes.clearToken}>Clear All</button>
                        </div>
                    </div>
                )}
                <div className={classes.mobileControlWrapper}>
                    <span
                        style={{
                            display: 'flex',
                            ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
                            color: toniqColors.pageSecondary.foregroundColor,
                        }}
                    >
                        NFTs&nbsp;{listings ? `(${filteredAndSortedListings.length})` : ''}
                    </span>
                    <div className={classes.sortWrapper}>
                        <button
                            className={classes.toggleSort}
                            onClick={() => {
                                sortType === 'asc' ? setSortType('desc') : setSortType('asc');
                                storeUserPreferences(
                                    'sortType',
                                    sortType === 'asc' ? 'desc' : 'asc',
                                );
                            }}
                        >
                            {sortType === 'asc' ? (
                                <ToniqIcon icon={ArrowsSortAscending24Icon} />
                            ) : (
                                <ToniqIcon icon={ArrowsSortDescending24Icon} />
                            )}
                        </button>
                        <ToniqDropdown
                            style={{
                                '--toniq-accent-secondary-background-color': 'transparent',
                                width: 'unset',
                            }}
                            selected={sort}
                            onSelectChange={event => {
                                setSort(event.detail);
                                storeUserPreferences('sortOption', event.detail);
                                pageListing.current = 0;
                                forceCheck();
                            }}
                            options={sortOptions.filter(sortOption => {
                                return sortOption.value.type === 'rarity' && !hasRarity()
                                    ? false
                                    : true;
                            })}
                        />
                    </div>
                </div>
                {getShowListings(chunkedAndFilteredAndSortedListings).length ? (
                    <div
                        className={`${gridSize === 'small' ? 'small' : ''} ${
                            classes.listingContainer
                        }`}
                    >
                        {hasListed()}
                        {getShowListings(chunkedAndFilteredAndSortedListings).map(
                            (listing, index) => {
                                return (
                                    <LazyLoad
                                        key={index}
                                        offset={[
                                            500,
                                            0,
                                        ]}
                                        placeholder={
                                            <NftCardPlaceholder
                                                small={gridSize === 'small'}
                                                style={{
                                                    maxWidth:
                                                        gridSize === 'small'
                                                            ? gridSmallMaxWidth
                                                            : gridLargeMaxWidth,
                                                    maxHeight:
                                                        gridSize === 'small'
                                                            ? gridSmallMaxHeight
                                                            : gridLargeMaxHeight,
                                                }}
                                            >
                                                {gridSize === 'large' ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            minHeight: '116px',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                marginBottom: '16px',
                                                                marginTop: '16px',
                                                                backgroundColor: preloaderItemColor,
                                                                width: 90,
                                                                height: 36,
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                        <div style={{display: 'flex'}}>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    flexGrow: 1,
                                                                    flexDirection: 'column',
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        marginBottom: '8px',
                                                                        backgroundColor:
                                                                            preloaderItemColor,
                                                                        width: 50,
                                                                        height: 24,
                                                                        borderRadius: '8px',
                                                                    }}
                                                                />
                                                                <span
                                                                    style={{
                                                                        backgroundColor:
                                                                            preloaderItemColor,
                                                                        width: 60,
                                                                        height: 16,
                                                                        borderRadius: '8px',
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                style={{
                                                                    backgroundColor:
                                                                        toniqColors.pageInteraction
                                                                            .foregroundColor,
                                                                    width: 92,
                                                                    height: 48,
                                                                    borderRadius: '8px',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    ''
                                                )}
                                            </NftCardPlaceholder>
                                        }
                                    >
                                        <Link
                                            to={`/marketplace/asset/` + getEXTID(listing.tokenid)}
                                            style={{textDecoration: 'none'}}
                                            rel="noopener noreferrer"
                                            onClick={() => {
                                                sessionStorage.setItem(
                                                    'scrollPosition',
                                                    window.pageYOffset,
                                                );
                                                sessionStorage.setItem(
                                                    'listingPage',
                                                    String(pageListing.current),
                                                );
                                            }}
                                        >
                                            <NftCard
                                                imageUrl={EntrepotNFTImage(
                                                    getEXTCanister(listing.canister),
                                                    index,
                                                    listing.tokenid,
                                                    false,
                                                    0,
                                                )}
                                                small={gridSize === 'small'}
                                                className={classes.nftCard}
                                                style={{
                                                    maxWidth:
                                                        gridSize === 'small'
                                                            ? gridSmallMaxWidth
                                                            : gridLargeMaxWidth,
                                                    maxHeight:
                                                        gridSize === 'small'
                                                            ? 'unset'
                                                            : gridLargeMaxHeight,
                                                }}
                                            >
                                                {gridSize === 'large' ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            minHeight: '116px',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                marginBottom: '16px',
                                                                marginTop: '16px',
                                                            }}
                                                        >
                                                            <span
                                                                style={cssToReactStyleObject(
                                                                    toniqFontStyles.h3Font,
                                                                )}
                                                            >
                                                                {listing.price ? (
                                                                    <PriceICP
                                                                        large={true}
                                                                        volume={true}
                                                                        clean={false}
                                                                        price={listing.price}
                                                                    />
                                                                ) : (
                                                                    'Unlisted'
                                                                )}
                                                            </span>
                                                        </span>
                                                        <div style={{display: 'flex'}}>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    flexGrow: 1,
                                                                    flexDirection: 'column',
                                                                }}
                                                            >
                                                                <span
                                                                    style={cssToReactStyleObject(
                                                                        toniqFontStyles.boldParagraphFont,
                                                                    )}
                                                                >
                                                                    #{listing.mintNumber || ''}
                                                                </span>
                                                                {typeof listing.rarity ===
                                                                    'number' && (
                                                                    <span
                                                                        style={{
                                                                            ...cssToReactStyleObject(
                                                                                toniqFontStyles.labelFont,
                                                                            ),
                                                                            opacity: '0.64',
                                                                        }}
                                                                    >
                                                                        NRI: {listing.rarity}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {listing.price ? (
                                                                <ToniqButton
                                                                    text="Buy Now"
                                                                    onClick={e => {
                                                                        e.preventDefault();
                                                                        buyNft(
                                                                            listing.canister,
                                                                            listing.index,
                                                                            listing,
                                                                            _updates,
                                                                        );
                                                                    }}
                                                                />
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                marginBottom: '12px',
                                                                marginTop: '16px',
                                                            }}
                                                        >
                                                            <span
                                                                style={cssToReactStyleObject(
                                                                    toniqFontStyles.boldParagraphFont,
                                                                )}
                                                            >
                                                                {listing.price ? (
                                                                    <PriceICP
                                                                        large={false}
                                                                        volume={true}
                                                                        clean={false}
                                                                        price={listing.price}
                                                                    />
                                                                ) : (
                                                                    'Unlisted'
                                                                )}
                                                            </span>
                                                        </span>
                                                        {listing.price ? (
                                                            <ToniqButton
                                                                text="Buy Now"
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    buyNft(
                                                                        listing.canister,
                                                                        listing.index,
                                                                        listing,
                                                                        _updates,
                                                                    );
                                                                }}
                                                                style={{
                                                                    height: '35px',
                                                                    ...cssToReactStyleObject(
                                                                        toniqFontStyles.boldFont,
                                                                    ),
                                                                    fontSize: 14,
                                                                }}
                                                            />
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                )}
                                                <MinimumOffer
                                                    tokenid={listing.tokenid}
                                                    gridSize={gridSize}
                                                />
                                                <div
                                                    className={classes.favourite}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '24px',
                                                        left: '24px',
                                                    }}
                                                    onClick={e => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <Favourite
                                                        refresher={faveRefresher}
                                                        identity={identity}
                                                        loggedIn={loggedIn}
                                                        tokenid={listing.tokenid}
                                                    />
                                                </div>
                                            </NftCard>
                                        </Link>
                                    </LazyLoad>
                                );
                            },
                        )}
                    </div>
                ) : (
                    ''
                )}
            </div>
            <StateContainer
                show={listings && !getShowListings(chunkedAndFilteredAndSortedListings).length}
            >
                No Result
            </StateContainer>
            <StateContainer
                innerRef={loadingRef}
                show={!listings || pageListing.current < chunkedAndFilteredAndSortedListings.length}
            >
                <ToniqIcon icon={LoaderAnimated24Icon} />
                &nbsp;Loading...
            </StateContainer>
            <StateContainer
                show={
                    pageListing.current !== 0 &&
                    chunkedAndFilteredAndSortedListings.length !== 0 &&
                    pageListing.current >= chunkedAndFilteredAndSortedListings.length
                }
            >
                End of Results
            </StateContainer>
        </div>
    );
}
