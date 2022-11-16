import React, {createRef, useState} from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    Grid,
    makeStyles,
    useMediaQuery,
    useTheme,
} from '@material-ui/core';
import {
    ChevronDown24Icon,
    ChevronUp24Icon,
    CircleWavyCheck24Icon,
    cssToReactStyleObject,
    ListDetails24Icon,
    toniqColors,
    toniqFontStyles,
    X24Icon,
} from '@toniq-labs/design-system';
import {EntrepotNFTImage, EntrepotNFTMintNumber} from '../../../utils';
import {useNavigate} from 'react-router-dom';
import {
    ToniqButton,
    ToniqChip,
    ToniqIcon,
} from '@toniq-labs/design-system/dist/esm/elements/react-components';
import Favourite from '../../../components/Favourite';
import {icpToString} from '../../../components/PriceICP';
import {DropShadowCard} from '../../../shared/DropShadowCard';
import {NftCard} from '../../../shared/NftCard';
import {getEXTCanister} from '../../../utilities/load-tokens';

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
    const benefitsContentWrapperRef = createRef();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const mockBenefits = [
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
        {
            name: 'Portal',
            provider: 'DSCVR',
            benefit:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        },
    ];
    const [
        isOpenBenefitDialog,
        setIsOpenBenefitDialog,
    ] = useState(false);

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

    const onScrollLeft = () => {
        benefitsContentWrapperRef.current.scrollBy(-100, 0);
    };

    const onScrollRight = () => {
        benefitsContentWrapperRef.current.scrollBy(100, 0);
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
                        <Grid item xs={12} className={classes.benefitsWrapper}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <span className={classes.detailSectionTitle}>Benefits</span>
                                <div>
                                    <div className={classes.viewListWrapper}>
                                        <button
                                            className={`${classes.viewList} ${classes.removeNativeButtonStyles}`}
                                            onClick={() => {
                                                setIsOpenBenefitDialog(true);
                                            }}
                                        >
                                            View List
                                        </button>
                                        <ToniqIcon
                                            icon={ListDetails24Icon}
                                            style={{
                                                color: toniqColors.pageInteraction.foregroundColor,
                                            }}
                                        />
                                        <span
                                            className={`${classes.verticalDivider} ${classes.hideWhenMobile}`}
                                        ></span>
                                        <div
                                            className={`${classes.benefitsControlsWrapper} ${classes.hideWhenMobile}`}
                                        >
                                            <button
                                                className={`${classes.removeNativeButtonStyles} ${classes.benefitsControls}`}
                                                onClick={onScrollLeft}
                                            >
                                                <ToniqIcon icon={ChevronDown24Icon} />
                                            </button>
                                            <button
                                                className={`${classes.removeNativeButtonStyles} ${classes.benefitsControls}`}
                                                onClick={onScrollRight}
                                            >
                                                <ToniqIcon icon={ChevronUp24Icon} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                ref={benefitsContentWrapperRef}
                                className={classes.benefitsContentWrapper}
                            >
                                {mockBenefits.map((benefit, index) => {
                                    return (
                                        <NftCard
                                            listStyle={true}
                                            imageUrl={EntrepotNFTImage(
                                                getEXTCanister(canister),
                                                index,
                                                tokenid,
                                                false,
                                                0,
                                            )}
                                            key={index}
                                            className={classes.benefitCard}
                                        >
                                            <span className={classes.benefitName}>
                                                {benefit.name}
                                            </span>
                                            <span className={classes.benefitProvider}>
                                                by {benefit.provider}
                                            </span>
                                        </NftCard>
                                    );
                                })}
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <Dialog
                open={isOpenBenefitDialog}
                fullWidth
                fullScreen={fullScreen}
                style={{paddingTop: 70}}
            >
                <DialogContent style={{overflow: 'hidden'}}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <div style={{display: 'flex', gap: 34, marginLeft: 12}}>
                            <span className={`${classes.benefitName} ${classes.hideWhenDesktop}`}>
                                List of Benefits
                            </span>
                            <span className={`${classes.benefitName} ${classes.hideWhenMobile}`}>
                                Provider
                            </span>
                            <span className={`${classes.benefitName} ${classes.hideWhenMobile}`}>
                                Benefit
                            </span>
                        </div>
                        <button
                            className={classes.removeNativeButtonStyles}
                            onClick={() => {
                                setIsOpenBenefitDialog(false);
                            }}
                        >
                            <ToniqIcon icon={X24Icon} />
                        </button>
                    </div>
                    <ToniqChip
                        text="Tap on a Provider below to view more information"
                        className={classes.hideWhenDesktop}
                        style={{width: '100%', padding: 10, marginBottom: 16}}
                    />
                    <div className={classes.dialogBenefitWrapper}>
                        {mockBenefits.map((benefit, index) => {
                            return (
                                <NftCard
                                    listStyle={true}
                                    imageUrl={EntrepotNFTImage(
                                        getEXTCanister(canister),
                                        index,
                                        tokenid,
                                        false,
                                        0,
                                    )}
                                    key={index}
                                    listImageSize={fullScreen ? '80px' : '96px'}
                                    className={classes.benefitCard}
                                >
                                    <span
                                        className={`${classes.benefitName} ${classes.hideWhenDesktop} ${classes.benefitNameWhenMobile}`}
                                    >
                                        {benefit.name}
                                    </span>
                                    <span
                                        className={`${classes.benefitDesc} ${classes.benefitNameWhenMobile}`}
                                    >
                                        {benefit.benefit}
                                    </span>
                                    <div className={classes.viewMoreBenefit}>
                                        <ToniqIcon
                                            icon={ChevronUp24Icon}
                                            style={{color: 'white', transform: 'rotate(90deg)'}}
                                        />
                                    </div>
                                </NftCard>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </Box>
    );
};
export default DetailSectionHeader;

const useStyles = makeStyles(theme => ({
    detailHeader: {
        [theme.breakpoints.up('md')]: {
            paddingBottom: 56,
        },
        [theme.breakpoints.down('sm')]: {
            paddingBottom: 32,
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
        marginBottom: 20,
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
        borderRadius: '16px',
        padding: 16,
        height: '100%',
        backgroundColor: 'white',
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
        paddingTop: 24,
    },
    detailSectionTitle: {
        ...cssToReactStyleObject(toniqFontStyles.h3Font),
    },
    viewListWrapper: {
        display: 'flex',
        gap: 6,
        alignItems: 'center',
    },
    viewList: {
        ...cssToReactStyleObject(toniqFontStyles.boldParagraphFont),
        color: toniqColors.pageInteraction.foregroundColor,
    },
    verticalDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.16)',
        margin: '0 20px',
    },
    benefitsControlsWrapper: {
        display: 'flex',
    },
    benefitsControls: {
        transform: 'rotate(90deg)',
        padding: 4,
        backgroundColor: 'white',
        borderRadius: 24,
        '&:hover': {
            boxShadow: '0px 0px 4px rgba(0, 208, 147, 0.5)',
            '& > toniq-icon': {
                color: toniqColors.pageInteraction.foregroundColor,
            },
        },
        '& > toniq-icon': {
            color: 'rgba(0, 0, 0, 0.4)',
        },
    },
    benefitsContentWrapper: {
        display: 'grid',
        gridTemplate: '1fr 1fr / repeat(auto-fill, 200px)',
        gridAutoFlow: 'column',
        gap: 20,
        overflowY: 'scroll',
        padding: '16px 0',
    },
    benefitCard: {
        gap: 12,
        minWidth: 200,
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            minWidth: 140,
        },
    },
    benefitName: {
        ...cssToReactStyleObject(toniqFontStyles.boldParagraphFont),
        [theme.breakpoints.up('sm')]: {
            fontSize: 20,
        },
    },
    benefitProvider: {
        ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
        [theme.breakpoints.down('sm')]: {
            ...cssToReactStyleObject(toniqFontStyles.labelFont),
        },
    },
    benefitDesc: {
        [theme.breakpoints.down('sm')]: {
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': 3,
            overflow: 'hidden',
        },
    },
    hideWhenMobile: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    hideWhenDesktop: {
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    viewMoreBenefit: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: 36,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: toniqColors.pageInteraction.foregroundColor,
        '&:hover': {
            backgroundColor: toniqColors.pageInteractionHover.foregroundColor,
        },
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    benefitNameWhenMobile: {
        marginRight: 36,
        [theme.breakpoints.down('sm')]: {
            marginRight: 'unset',
        },
    },
    dialogBenefitWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxHeight: 500,
        overflow: 'auto',
        padding: '20px 16px 20px 0',
        '&::-webkit-scrollbar': {
            width: 8,
        },
        '&::-webkit-scrollbar-track': {
            width: 8,
            borderRadius: 20,
            backgroundColor: '#F0F0F0',
        },
        '&::-webkit-scrollbar-thumb': {
            width: 6,
            height: 120,
            borderRadius: 20,
            backgroundColor: '#00D093',
        },
    },
}));
