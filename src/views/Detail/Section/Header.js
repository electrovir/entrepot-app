import React from 'react';
import {Box, Grid, makeStyles} from '@material-ui/core';
import {
    CircleWavyCheck24Icon,
    cssToReactStyleObject,
    toniqColors,
    toniqFontStyles,
} from '@toniq-labs/design-system';
import {EntrepotNFTMintNumber} from '../../../utils';
import {useNavigate} from 'react-router-dom';
import {ToniqButton, ToniqIcon} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import Favourite from '../../../components/Favourite';
import {icpToString} from '../../../components/PriceICP';
import {DropShadowCard} from '../../../shared/DropShadowCard';

const DetailSectionHeader = props => {
    const {
        owner,
        listing,
        offers,
        transactions,
        _afterList,
        _afterBuy,
        displayImage,
        tokenid,
        index,
        canister,
        setOpenOfferForm,
    } = props;
    const collection = props.collections.find(e => e.canister === canister);
    const classes = useStyles();
    const navigate = useNavigate();

    const getPriceData = () => {
        if (listing.price > 0n) {
            return listing.price;
        } else if (offers && offers.length > 0) {
            return offers[0].amount;
        } else if (transactions && transactions.length > 0) {
            return transactions[0].price;
        } else {
            return undefined;
        }
    };

    const cancelListing = () => {
        props.list(tokenid, 0, props.loader, _afterList);
    };

    const makeOffer = async () => {
        setOpenOfferForm(true);
    };

    return (
        <Box className={classes.detailHeader}>
            <div className={classes.detailSectionHeader}>
                <Grid item xs={12} sm={5}>
                    <DropShadowCard
                        className={classes.imageWrapperContainer}
                        style={{padding: '1px'}}
                    >
                        <div className={classes.imageWrapper}>{displayImage(tokenid)}</div>
                    </DropShadowCard>
                </Grid>
                <Grid item xs={12} sm={7} className={classes.headerContent}>
                    <Grid container style={{height: '100%'}}>
                        <Grid item xs={12} className={classes.namePriceContainer}>
                            <div className={classes.nameContent}>
                                <Grid container justifyContent="space-between" alignItems="center">
                                    <Grid item>
                                        <span
                                            style={{
                                                ...cssToReactStyleObject(toniqFontStyles.h2Font),
                                                display: 'block',
                                            }}
                                        >
                                            {collection.name} #
                                            {EntrepotNFTMintNumber(collection.canister, index)}
                                        </span>
                                    </Grid>
                                    <Grid item>
                                        <Favourite
                                            className={classes.favourite}
                                            showcount={true}
                                            count={2}
                                            refresher={props.faveRefresher}
                                            identity={props.identity}
                                            loggedIn={props.loggedIn}
                                            tokenid={tokenid}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                            <div className={classes.priceContent}>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button
                                        className={classes.removeNativeButtonStyles}
                                        style={{
                                            ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
                                            marginRight: '11px',
                                        }}
                                        onClick={() => {
                                            navigate('/marketplace/' + collection.route);
                                        }}
                                    >
                                        <span className={classes.hoverText}>{collection.name}</span>
                                    </button>
                                    {collection.kyc ? (
                                        <ToniqIcon
                                            icon={CircleWavyCheck24Icon}
                                            style={{
                                                color: toniqColors.pageInteraction.foregroundColor,
                                            }}
                                        />
                                    ) : (
                                        ''
                                    )}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 16,
                                    }}
                                >
                                    <div className={classes.nftDescContainer3}>
                                        {getPriceData() ? (
                                            <span
                                                style={{
                                                    fontWeight: '600',
                                                    fontSize: '36px',
                                                    lineHeight: '48px',
                                                    color: toniqColors.pagePrimary.foregroundColor,
                                                }}
                                            >
                                                {icpToString(getPriceData(), true, true)} ICP
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    ...cssToReactStyleObject(
                                                        toniqFontStyles.boldFont,
                                                    ),
                                                    ...cssToReactStyleObject(
                                                        toniqFontStyles.h3Font,
                                                    ),
                                                }}
                                            >
                                                Unlisted
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        {owner &&
                                        props.account &&
                                        props.account.address === owner ? (
                                            <div style={{display: 'flex', gap: '16px'}}>
                                                {listing !== false &&
                                                listing &&
                                                listing.price > 0n ? (
                                                    <>
                                                        <ToniqButton
                                                            text="Update Listing"
                                                            onClick={() => {
                                                                props.listNft(
                                                                    {
                                                                        id: tokenid,
                                                                        listing: listing,
                                                                    },
                                                                    props.loader,
                                                                    _afterList,
                                                                );
                                                            }}
                                                        />
                                                        <ToniqButton
                                                            text="Cancel Listing"
                                                            className="toniq-button-secondary"
                                                            onClick={() => {
                                                                cancelListing();
                                                            }}
                                                        />
                                                        {/* <ToniqButton title="More Options" icon={DotsVertical24Icon} className="toniq-button-secondary" /> */}
                                                    </>
                                                ) : (
                                                    <ToniqButton
                                                        text="List Item"
                                                        onClick={() => {
                                                            props.listNft(
                                                                {
                                                                    id: tokenid,
                                                                    listing: listing,
                                                                },
                                                                props.loader,
                                                                _afterList,
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{display: 'flex', gap: '16px'}}>
                                                <ToniqButton
                                                    text="Buy Now"
                                                    onClick={() => {
                                                        props.buyNft(
                                                            collection.canister,
                                                            index,
                                                            listing,
                                                            _afterBuy,
                                                        );
                                                    }}
                                                />
                                                <ToniqButton
                                                    text="Make Offer"
                                                    className="toniq-button-outline"
                                                    onClick={() => {
                                                        makeOffer();
                                                    }}
                                                />
                                                {/* <ToniqButton title="More Options" icon={DotsVertical24Icon} className="toniq-button-secondary" /> */}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} className={classes.benefitsWrapper}></Grid>
                    </Grid>
                </Grid>
            </div>
        </Box>
    );
};
export default DetailSectionHeader;

const useStyles = makeStyles(theme => ({
    detailHeader: {
        [theme.breakpoints.up('md')]: {
            margin: '16px 0',
        },
    },
    detailSectionHeader: {
        display: 'flex',
        gap: 32,
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
        },
    },
    removeNativeButtonStyles: {
        background: 'none',
        padding: 0,
        margin: 0,
        border: 'none',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        textTransform: 'inherit',
        textDecoration: 'inherit',
        '-webkit-tap-highlight-color': 'transparent',
    },
    headerContent: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '32px!important',
        [theme.breakpoints.down('md')]: {
            paddingTop: '16px!important',
        },
        [theme.breakpoints.down('xs')]: {
            justifyContent: 'left',
        },
    },
    namePriceContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: 1,
    },
    nameContent: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '8px',
        [theme.breakpoints.up('sm')]: {
            gap: '32px',
        },
        [theme.breakpoints.down('xs')]: {
            gap: '16px',
        },
    },
    priceContent: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '8px',
        [theme.breakpoints.up('sm')]: {
            gap: '40px',
        },
        [theme.breakpoints.down('xs')]: {
            gap: '16px',
        },
    },
    nftDescContainer3: {
        gap: '16px',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
            alignItems: 'center',
        },
        [theme.breakpoints.down('md')]: {
            display: 'grid',
        },
    },
    hoverText: {
        '&:hover': {
            color: toniqColors.pageInteraction.foregroundColor,
        },
    },
    imageWrapperContainer: {
        '&::after': {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background:
                'linear-gradient(to left, rgba(0, 208, 147, 0), rgba(0, 208, 147, 0.2), rgba(0, 208, 147, 0.4), rgba(0, 208, 147, 1))',
            content: '""',
            zIndex: '-1',
            borderRadius: '17px',
        },
    },
    imageWrapper: {
        [theme.breakpoints.up('md')]: {
            display: 'grid',
        },
        [theme.breakpoints.down('md')]: {
            display: 'flex',
            justifyContent: 'center',
        },
        '& div': {
            borderRadius: '16px',
        },
        borderRadius: '16px',
        padding: 16,
        height: '100%',
        backgroundColor: 'white',
    },
    accordionWrapper: {
        [theme.breakpoints.up('md')]: {
            margin: '32px 0',
        },
        [theme.breakpoints.down('md')]: {
            margin: '16px 0',
        },
    },
    favourite: {
        color: toniqColors.pagePrimary.foregroundColor,
        '& > toniq-icon': {
            color: toniqColors.pageTertiary.foregroundColor,
            filter: 'none',
            '&:hover': {
                color: toniqColors.pageInteraction.foregroundColor,
            },
        },
    },
    benefitsWrapper: {
        borderTop: '1px solid rgba(0,0,0, 0.08)',
    },
}));
