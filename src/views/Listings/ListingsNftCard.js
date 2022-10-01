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
    cssToReactStyleObject,
    LoaderAnimated24Icon,
    toniqColors,
    toniqFontStyles,
} from '@toniq-labs/design-system';
import {getEXTCanister, getEXTID} from '../../utilities/load-tokens';
import {Link} from 'react-router-dom';
import {NftCard} from '../../shared/NftCard';
import {EntrepotNFTImage} from '../../utils';
import PriceICP from '../../components/PriceICP';
import {ToniqButton, ToniqIcon} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import {MinimumOffer} from '../../components/shared/MinimumOffer';
import Favourite from '../../components/Favourite';
import {StateContainer} from '../../components/shared/StateContainer';
import {ListingInfo} from './ListingInfo';

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
    } = props;
    const classes = useStyles();
    const preloaderItemColor = '#f1f1f1';

    const chunkedAndFilteredAndSortedListings = chunk(
        filteredAndSortedListings,
        gridSize === 'small' ? 24 : 12,
    );

    const hasListed = () => {
        hasListing.current = true;
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
            {getShowListings(chunkedAndFilteredAndSortedListings).length ? (
                <div
                    className={`${gridSize === 'small' ? 'small' : ''} ${classes.listingContainer}`}
                >
                    {hasListed()}
                    {getShowListings(chunkedAndFilteredAndSortedListings).map((listing, index) => {
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
                                                                backgroundColor: preloaderItemColor,
                                                                width: 50,
                                                                height: 24,
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                backgroundColor: preloaderItemColor,
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
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                                                        {typeof listing.rarity === 'number' && (
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
                                            ''
                                        )}
                                        <MinimumOffer
                                            tokenid={listing.tokenid}
                                            gridSize={gridSize}
                                        />
                                        {gridSize !== 'large' && (
                                            <ListingInfo
                                                gridSize={gridSize}
                                                buyNft={buyNft}
                                                listing={listing}
                                                _updates={_updates}
                                            />
                                        )}
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
                    })}
                </div>
            ) : (
                ''
            )}
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
