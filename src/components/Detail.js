/* global BigInt */
import React, { useState } from "react";
import {
  makeStyles,
  Container,
  Box,
  Grid,
} from "@material-ui/core";
import PriceICP, { icpToString } from './PriceICP';
import PriceUSD from './PriceUSD';
import OfferForm from './OfferForm';
import { useNavigate } from "react-router-dom";
import extjs from "../ic/extjs.js";
import { EntrepotNFTImage, EntrepotNFTLink, EntrepotNFTMintNumber, EntrepotGetICPUSD, EntrepotCollectionStats } from '../utils';
import {
  useParams
} from "react-router-dom";
import {redirectIfBlockedFromEarnFeatures} from '../location/redirect-from-marketplace';
import { ToniqIcon, ToniqChip, ToniqButton, ToniqMiddleEllipsis, ToniqPagination } from '@toniq-labs/design-system/dist/esm/elements/react-components';
import { ArrowLeft24Icon, CircleWavyCheck24Icon, cssToReactStyleObject, DotsVertical24Icon, toniqColors, toniqFontStyles } from '@toniq-labs/design-system';
import {css} from 'element-vir';
import {unsafeCSS} from 'lit';
import { DropShadowCard } from "../shared/DropShadowCard";
import { Accordion } from "./Accordion";
import Timestamp from "react-timestamp";
import chunk from "lodash.chunk";

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
const api = extjs.connect("https://boundary.ic0.app/");

const TREASURECANISTER = "yigae-jqaaa-aaaah-qczbq-cai";
const shorten = a => {
  return a.substring(0, 18) + "...";
};

const Detail = (props) => {
  let { tokenid } = useParams();
  let { index, canister} = extjs.decodeTokenId(tokenid);
  const navigate = useNavigate();
  const [floor, setFloor] = useState((EntrepotCollectionStats(canister) ? EntrepotCollectionStats(canister).floor : ""));
  const [listing, setListing] = useState(false);
  const [detailsUrl, setDetailsUrl] = useState(false);
  const [transactions, setTransactions] = useState(false);
  const [history, setHistory] = useState(false);
  const [page, setPage] = useState(0);
  const [owner, setOwner] = useState(false);
  const [offers, setOffers] = useState(false);
  const [openOfferForm, setOpenOfferForm] = useState(false);
  const collection = props.collections.find(e => e.canister === canister)
  
  redirectIfBlockedFromEarnFeatures(navigate, collection, props);
  
  const classes = useStyles();

  const reloadOffers = async () => {
    await api.canister("6z5wo-yqaaa-aaaah-qcsfa-cai").offers(tokenid).then(r => {
      setOffers(r.map(a => {return {buyer : a[0], amount : a[1], time : a[2]}}).sort((a,b) => Number(b.amount)-Number(a.amount)));
    });
  }

  const cancelListing = () => {
    props.list(tokenid, 0, props.loader, _afterList);
  };

  const _refresh = async () => {
    reloadOffers();
    await fetch("https://us-central1-entrepot-api.cloudfunctions.net/api/token/"+tokenid).then(r => r.json()).then(r => {
      setListing({
        price : BigInt(r.price),
        time : r.time,
      });

      setOwner(r.owner);
      setTransactions(chunk(r.transactions, 9));
      setHistory(transactions[page]);
    });
  }

  const _afterList = async () => {
    await _refresh();
  };

  const _afterBuy = async () => {
    await reloadOffers();
    await _refresh();
  }

  const closeOfferForm = () => {
    reloadOffers();
    setOpenOfferForm(false);
  };

  const getFloorDelta = amount => {
    if (!floor) return "-";
    var fe = (floor*100000000);
    var ne = Number(amount);
    if (ne > fe){
      return (((ne-fe)/ne)*100).toFixed(2)+"% above";
    } else if (ne < fe) {      
      return ((1-(ne/fe))*100).toFixed(2)+"% below";
    } else return "-"
  };

  const makeOffer = async () => {
    setOpenOfferForm(true);
  };
  
  useInterval(_refresh, 2  * 1000);
  useInterval(() => {
    var nf = (EntrepotCollectionStats(canister) ? EntrepotCollectionStats(canister).floor : "");
    setFloor(nf);
  }, 10 * 1000);
  
  const cancelOffer = async () => {
    props.loader(true, "Cancelling offer...");
    const _api = extjs.connect("https://boundary.ic0.app/", props.identity);
    await _api.canister("6z5wo-yqaaa-aaaah-qcsfa-cai").cancelOffer(tokenid);
    await reloadOffers();
    props.loader(false);
    props.alert(
      "Offer cancelled",
      "Your offer was cancelled successfully!"
    );
  };

  const getDetailsUrl = async (url, regExp) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const text = await blob.text();
    const simplifiedText = text.replace('\n', ' ').replace(/\s{2,}/, ' ');
    setDetailsUrl(simplifiedText.match(regExp)[1]);
  }

  const imageStyles = cssToReactStyleObject(css`
    background-image: url('${unsafeCSS(detailsUrl ? detailsUrl : EntrepotNFTImage(canister, index, tokenid, true))}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding-top: 100%;
    width: 100%;
  `); 

  const extractEmbeddedImage = (svgUrl, classes) => {
    getDetailsUrl(svgUrl, /image href="([^"]+)"/);

    return (
      <div className={classes.nftImage}>
        <div style={imageStyles} />
      </div>
    );
  }
  
  const extractEmbeddedVideo = (iframeUrl, classes) => {
    getDetailsUrl(iframeUrl, /source src="([^"]+)"/);
    if(detailsUrl){
      return (
        <video className={classes.nftVideo} width="100%" autoPlay muted loop>
          <source src={detailsUrl} type="video/mp4" />
        </video>
      );
    }
  }
  
  const displayImage = tokenid => {
    let { index, canister} = extjs.decodeTokenId(tokenid);
    switch(canister){
      
      // for generative collections where assets are all stored on the same canister
      // case "zvycl-fyaaa-aaaah-qckmq-cai": IC Apes doesn't work
      case "7gvfz-3iaaa-aaaah-qcsbq-cai":
      case "bxdf4-baaaa-aaaah-qaruq-cai":
      case "dylar-wyaaa-aaaah-qcexq-cai":
      case "jxpyk-6iaaa-aaaam-qafma-cai":
      case "e3izy-jiaaa-aaaah-qacbq-cai":
      case "3mttv-dqaaa-aaaah-qcn6q-cai":
      case "yrdz3-2yaaa-aaaah-qcvpa-cai":
      case "3bqt5-gyaaa-aaaah-qcvha-cai":
      case "unssi-hiaaa-aaaah-qcmya-cai":
      case "sr4qi-vaaaa-aaaah-qcaaq-cai":
      case "nbg4r-saaaa-aaaah-qap7a-cai":
      case "gtb2b-tiaaa-aaaah-qcxca-cai":
      case "qbc6i-daaaa-aaaah-qcywq-cai":
      case "qjwjm-eaaaa-aaaah-qctga-cai":
      case "j3dqa-byaaa-aaaah-qcwfa-cai":
      case "2l7rh-eiaaa-aaaah-qcvaa-cai":
      case "73xld-saaaa-aaaah-qbjya-cai":
      case "t2mog-myaaa-aaaal-aas7q-cai":
        return (
          <div className={classes.nftImage}>
            <div style={imageStyles} />
          </div>
        );
        break;
      
      // for interactive NFTs or videos
      //case "xcep7-sqaaa-aaaah-qcukq-cai":
      //case "rqiax-3iaaa-aaaah-qcyta-cai":
      case "dv6u3-vqaaa-aaaah-qcdlq-cai":
      case "eb7r3-myaaa-aaaah-qcdya-cai":
      case "pk6rk-6aaaa-aaaae-qaazq-cai":
      case "dhiaa-ryaaa-aaaae-qabva-cai":
      case "mk3kn-pyaaa-aaaah-qcoda-cai":
      case "jeghr-iaaaa-aaaah-qco7q-cai":
      case "er7d4-6iaaa-aaaaj-qac2q-cai":
      case "poyn6-dyaaa-aaaah-qcfzq-cai":
      case "crt3j-mqaaa-aaaah-qcdnq-cai":
      case "nges7-giaaa-aaaaj-qaiya-cai":
      case "ag2h7-riaaa-aaaah-qce6q-cai":
      case "ri5pt-5iaaa-aaaan-qactq-cai":
      case "sbcwr-3qaaa-aaaam-qamoa-cai":
      case "sbcwr-3qaaa-aaaam-qamoa-cai":
      case "3db6u-aiaaa-aaaah-qbjbq-cai": // drip test
      case "5stux-vyaaa-aaaam-qasoa-cai":
      case "e4ca6-oiaaa-aaaai-acm2a-cai":
      case "skjpp-haaaa-aaaae-qac7q-cai":
      case TREASURECANISTER:
        return (
          <iframe
            frameBorder="0"
            src={EntrepotNFTImage(canister, index, tokenid, true)}
            alt=""
            className={classes.nftIframe}
          />
        );
        break;
      
      // for videos that don't fit in the iframe and need a video tag
      case "rqiax-3iaaa-aaaah-qcyta-cai":
      case "xcep7-sqaaa-aaaah-qcukq-cai":
      case "x4oqm-bqaaa-aaaam-qahaq-cai":
      case "tco7x-piaaa-aaaam-qamiq-cai":
        return extractEmbeddedVideo(EntrepotNFTImage(canister, index, tokenid, true), classes);
      // for pre-generated images residing on asset canisters
      // case "rw623-hyaaa-aaaah-qctcq-cai": doesn't work for OG medals 
      case "6wih6-siaaa-aaaah-qczva-cai":
      case "6km5p-fiaaa-aaaah-qczxa-cai":
      case "s36wu-5qaaa-aaaah-qcyzq-cai":
      case "bzsui-sqaaa-aaaah-qce2a-cai":
      case "txr2a-fqaaa-aaaah-qcmkq-cai":
      case "ah2fs-fqaaa-aaaak-aalya-cai":
      case "z7mqv-liaaa-aaaah-qcnqa-cai":
      case "erpx2-pyaaa-aaaah-qcqsq-cai":
      case "gikg4-eaaaa-aaaam-qaieq-cai":
      case "bapzn-kiaaa-aaaam-qaiva-cai":
      case "4wiph-kyaaa-aaaam-qannq-cai":
      case "3cjkh-tqaaa-aaaam-qan6a-cai":
      case "lcgbg-kaaaa-aaaam-qaota-cai":
      case "j7n3m-7iaaa-aaaam-qarza-cai":
      case "zydwz-laaaa-aaaam-qasuq-cai":
      case "xgket-maaaa-aaaam-qatwq-cai":
      case "wlea5-diaaa-aaaam-qatra-cai":
      case "vvvht-eyaaa-aaaam-qatya-cai":
        return extractEmbeddedImage(EntrepotNFTImage(canister, index, tokenid, true), classes);
      
      // default case is to just use the thumbnail on the detail page
      default:
        return (
          <div className={classes.nftImage}>
            <div style={imageStyles} />
          </div>
        );
        break;
    }
  };

  // Mock attributes data; Hidden for now until API has attributes data
  const attributes = [
    {
      groupName: 'Group #1',
      data: [
        {
          label: 'Background',
          value: '#5452',
          desc: '5% Have This'
        },
        {
          label: 'Background',
          value: '#5462',
          desc: '17% Have This'
        },
        {
          label: 'Background',
          value: '#6312',
          desc: '3% Have This'
        },
        {
          label: 'Background',
          value: '#1123',
          desc: '76% Have This'
        }
      ]
    },
    {
      groupName: 'Group #2',
      data: [
        {
          label: 'Body Color',
          value: '#5631',
          desc: '4% Have This'
        },
        {
          label: 'Body Color',
          value: '#2123',
          desc: '98% Have This'
        },
        {
          label: 'Body Color',
          value: '#6631',
          desc: '7% Have This'
        },
        {
          label: 'Body Color',
          value: '#5643',
          desc: '21% Have This'
        }
      ]
    }
  ]

  const onPageChange = (event) => {
    setPage(event.detail - 1);
  }
  
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
  }

  React.useEffect(() => {
    props.loader(true);
    _refresh().then(() => props.loader(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Container maxWidth="xl" className={classes.container}>
        <button
          variant="text"
          onClick={() => navigate(-1)}
          className={classes.removeNativeButtonStyles}
        >
          <Grid container spacing={1}>
            <Grid item>
              <ToniqIcon icon={ArrowLeft24Icon}>Return to Collection</ToniqIcon>
            </Grid>
            <Grid item>
              <span style={cssToReactStyleObject(toniqFontStyles.boldParagraphFont)}>Return to Collection</span>
            </Grid>
          </Grid>
        </button>
        <DropShadowCard className={classes.nftCard}>
          <Container className={classes.nftDescWrapper} style={{maxWidth: 1312}}>
            <Box className={classes.nftDescHeader}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} className={classes.imageWrapper}>
                  {displayImage(tokenid)}
                </Grid>
                <Grid item xs={12} sm={6} className={classes.nftDesc}>
                  <div className={classes.nftDescContainer1}>
                    <span style={{...cssToReactStyleObject(toniqFontStyles.h2Font), display: "block"}}>{collection.name} #{EntrepotNFTMintNumber(collection.canister, index)}</span>
                    <Box style={{cursor: "pointer"}}>
                      <ToniqChip text="View NFT OnChain" onClick={() => {
                        window.open(EntrepotNFTLink(collection.canister, index, tokenid), '_blank')
                      }}/>
                    </Box>
                    <span style={{...cssToReactStyleObject(toniqFontStyles.labelFont), opacity: "0.64"}}>COLLECTION</span>
                  </div>
                  <div className={classes.nftDescContainer2}>
                    <div style={{ display: "flex", alignItems: "center"}}>
                      <button
                        className={classes.removeNativeButtonStyles}
                        style={{...cssToReactStyleObject(toniqFontStyles.paragraphFont), marginRight: "11px"}}
                        onClick={() => {
                          navigate("/marketplace/"+collection.route)
                        }}
                      >
                        <span className={classes.hoverText}>{collection.name}</span>
                      </button>
                      <ToniqIcon icon={CircleWavyCheck24Icon} style={{ color: "#00D093" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center"}}>
                      <div className={classes.nftDescContainer3}>
                        {getPriceData() ? 
                          <>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <PriceICP large={true} volume={true} clean={false} size={20} price={getPriceData()} />
                              <span style={{ ...cssToReactStyleObject(toniqFontStyles.paragraphFont), marginLeft: "8px" }}>(<PriceUSD price={EntrepotGetICPUSD(getPriceData())} />)</span>
                            </div>
                          </> : 
                          <>
                            <span style={{
                                ...cssToReactStyleObject(toniqFontStyles.boldFont),
                                ...cssToReactStyleObject(toniqFontStyles.h3Font)
                              }}>
                                Unlisted
                            </span>
                          </>
                        }
                        {owner && props.account && props.account.address === owner ? (
                          <div style={{ display: "flex", gap: "16px" }}>
                            {listing !== false && listing && listing.price > 0n ? (
                              <>
                                <ToniqButton text="Update Listing" onClick={() => {
                                  props.listNft({ id: tokenid, listing: listing }, props.loader, _afterList);
                                }}/>
                                <ToniqButton text="Cancel Listing" className="toniq-button-secondary" onClick={() => {
                                  cancelListing();
                                }}/>
                                {/* <ToniqButton title="More Options" icon={DotsVertical24Icon} className="toniq-button-secondary" /> */}
                              </>
                            ) : (
                              <ToniqButton text="List Item" onClick={() => {
                                props.listNft({ id: tokenid, listing: listing }, props.loader, _afterList);
                              }}/>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "16px" }}>
                            <ToniqButton text="Buy Now" onClick={() => {
                              props.buyNft(collection.canister, index, listing, _afterBuy);
                            }}/>
                            <ToniqButton text="Make Offer" className="toniq-button-secondary" onClick={() => {
                              makeOffer();
                            }}/>
                            {/* <ToniqButton title="More Options" icon={DotsVertical24Icon} className="toniq-button-secondary" /> */}
                          </div>
                        )}
                      </div>
                    </div>
                    {owner ? 
                      <>
                        {props.account.address === owner ? (
                          <span className={classes.ownerWrapper}>
                            Owned by you
                          </span>
                        ) : (
                          <span className={classes.ownerWrapper}>
                            {/* {`Owned by `} */}
                            {`Owner `}
                            {/* <span className={classes.ownerName}>ChavezOG</span> */}
                            : &nbsp;
                            <span className={classes.ownerAddress} onClick={() => {
                              window.open(`https://dashboard.internetcomputer.org/account/${owner}`, '_blank')
                            }}>{shorten(owner)}</span>
                          </span>
                        )}
                      </> : <></>
                    }
                  </div>
                </Grid>
              </Grid>
            </Box>
            <Accordion title="Offers" open={true}>
              {offers && offers.length > 0 ? 
                <Grid container className={classes.accordionWrapper}>
                  <span style={{...cssToReactStyleObject(toniqFontStyles.paragraphFont), opacity: "0.64"}}>Results ({offers.length})</span>
                  <Grid container className={classes.tableHeader}>
                    <Grid item xs={8} sm={6} md={3} className={classes.tableHeaderName} style={{ display: "flex", justifyContent: "center" }}>Time</Grid>
                    <Grid item xs={1} sm={2} md={2} className={classes.tableHeaderName}>Floor Delta</Grid>
                    <Grid item xs={1} sm={2} md={4} className={classes.tableHeaderName}>Buyer</Grid>
                    <Grid item xs={2} md={3} className={classes.tableHeaderName} style={{ display: "flex", justifyContent: "right" }}>Price</Grid>
                  </Grid>
                  <Grid container spacing={2} className={classes.ntfCardContainer}>
                    {offers.slice().map((offer, index) => (
                      <Grid item key={index} xs={12}>
                        <DropShadowCard>
                          <Grid container className={classes.historyCard} alignItems="center">
                            <Grid item xs={8} sm={6} md={3}>
                              <Grid container alignItems="center" spacing={4}>
                                <Grid item xs={4} className={classes.imageWrapperHistory}>
                                  {displayImage(tokenid)}
                                </Grid>
                                <Grid item xs={8}>
                                  <div>
                                    <span>
                                      <Timestamp
                                        relative
                                        autoUpdate
                                        date={Number(offer.time / 1000000000n)}
                                      />
                                    </span>
                                    <span className={classes.buyerMobile}>
                                      {props.identity && props.identity.getPrincipal().toText() === offer.buyer.toText() ? 
                                        <ToniqButton text="Cancel" onClick={cancelOffer} /> : 
                                        <ToniqMiddleEllipsis externalLink={true} letterCount={5} text={offer.buyer.toText()} />
                                      }
                                    </span>
                                  </div>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item xs={1} sm={2} md={2} className={classes.buyerDesktop}>{floor ? getFloorDelta(offer.amount) : "-"}</Grid>
                            <Grid item xs={1} sm={2} md={4} className={classes.buyerDesktop}>
                              {props.identity && props.identity.getPrincipal().toText() === offer.buyer.toText() ? 
                                <ToniqButton text="Cancel" onClick={cancelOffer} /> : 
                                <ToniqMiddleEllipsis externalLink={true} letterCount={5} text={offer.buyer.toText()} />
                              }
                            </Grid>
                            <Grid item xs={2} md={3} style={{ display: "flex", justifyContent: "right", fontWeight: "700", color: "#00D093" }}>+{icpToString(offer.amount, true, true)}</Grid>
                          </Grid>
                        </DropShadowCard>
                      </Grid>
                    ))}
                  </Grid>
                  <div className={classes.pagination}>
                    <ToniqPagination
                      currentPage={page+1}
                      pageCount={transactions.length}
                      pagesShown={6}
                      onPageChange={onPageChange}
                    />
                  </div>
                </Grid> : 
                <Grid className={classes.accordionWrapper}>
                  <span className={classes.offerDesc}>There are currently no offers!</span>
                </Grid>
              }
            </Accordion>
            {/* Hidden for now until API has data */}
            {/* <Accordion title="Attributes" open={true}>
							<Grid container className={classes.accordionWrapper}>
                {attributes.map((attribute) => (
                  <Grid item key={attribute.groupName} xs={12}>
                    <span style={cssToReactStyleObject(toniqFontStyles.boldParagraphFont)}>{attribute.groupName}</span>
                    <Grid container className={classes.attributeWrapper} spacing={2}>
                      {attribute.data.map((data) => (
                        <Grid item key={data.value} xs={12} md={3}>
                          <DropShadowCard style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "0"}}>
                            <span className={classes.attributeHeader}>
                              <span style={cssToReactStyleObject(toniqFontStyles.paragraphFont)}>{data.label}</span>
                            </span>
                            <Grid container style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 8px 16px 8px" }} spacing={2}>
                              <Grid item>
                                <span style={{...cssToReactStyleObject(toniqFontStyles.h2Font), ...cssToReactStyleObject(toniqFontStyles.boldFont)}}>{data.value}</span>
                              </Grid>
                              <Grid item>
                                <ToniqChip className="toniq-chip-secondary" text={data.desc}></ToniqChip>
                              </Grid>
                            </Grid>
                          </DropShadowCard>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Accordion> */}
            <Accordion title="History" open={true}>
              {history && history.length > 0 ? 
                <Grid container className={classes.accordionWrapper}>
                  <span style={{...cssToReactStyleObject(toniqFontStyles.paragraphFont), opacity: "0.64"}}>Results ({history.length})</span>
                  <Grid container className={classes.tableHeader}>
                    <Grid item xs={8} sm={6} md={3} className={classes.tableHeaderName} style={{ display: "flex", justifyContent: "center" }}>Date</Grid>
                    <Grid item xs={1} sm={2} md={2} className={classes.tableHeaderName}>Activity</Grid>
                    <Grid item xs={1} sm={2} md={4} className={classes.tableHeaderName}>Details</Grid>
                    <Grid item xs={2} md={3} className={classes.tableHeaderName} style={{ display: "flex", justifyContent: "right" }}>Cost</Grid>
                  </Grid>
                  <Grid container spacing={2} className={classes.ntfCardContainer}>
                    {history.slice().map((transaction, index) => (
                      <Grid item key={index} xs={12}>
                        <DropShadowCard>
                          <Grid container className={classes.historyCard} alignItems="center">
                            <Grid item xs={8} sm={6} md={3}>
                              <Grid container alignItems="center" spacing={4}>
                                <Grid item xs={4} className={classes.imageWrapperHistory}>
                                  {displayImage(tokenid)}
                                </Grid>
                                <Grid item xs={8}>
                                  <div>
                                    <span>
                                      <Timestamp
                                        relative
                                        autoUpdate
                                        date={Number(BigInt(transaction.time) / 1000000000n)}
                                      />
                                    </span>
                                    <span className={classes.buyerMobile}>
                                      TO: &nbsp;<ToniqMiddleEllipsis externalLink={true} letterCount={5} text={transaction.buyer} />
                                    </span>
                                  </div>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item xs={1} sm={2} md={2} className={classes.buyerDesktop}>Sale</Grid>
                            <Grid item xs={1} sm={2} md={4} className={classes.buyerDesktop}>
                              TO:  &nbsp;<ToniqMiddleEllipsis externalLink={true} letterCount={5} text={transaction.buyer} />
                            </Grid>
                            <Grid item xs={2} md={3} style={{ display: "flex", justifyContent: "right", fontWeight: "700", color: "#00D093" }}>+{icpToString(transaction.price, true, true)}</Grid>
                          </Grid>
                        </DropShadowCard>
                      </Grid>
                    ))}
                  </Grid>
                  <div className={classes.pagination}>
                    <ToniqPagination
                      currentPage={page+1}
                      pageCount={transactions.length}
                      pagesShown={6}
                      onPageChange={onPageChange}
                    />
                  </div>
                </Grid> : 
                <Grid className={classes.accordionWrapper}>
                  <span className={classes.offerDesc}>No Activity</span>
                </Grid>
              }
            </Accordion>
          </Container>
        </DropShadowCard>
      </Container>
      <OfferForm floor={floor} address={props.account.address} balance={props.balance} complete={reloadOffers} identity={props.identity} alert={props.alert} open={openOfferForm} close={closeOfferForm} loader={props.loader} error={props.error} tokenid={tokenid} />
    </>
  );
};
export default Detail;

const useStyles = makeStyles((theme) => ({
  btn: {
    backgroundColor: "#ffffff",
    marginLeft: "10px",
    color: "#2B74DC",
    fontWeight: "bold",
    boxShadow: "none",
    border: "1px solid #2B74DC",
    textTransform: "capitalize",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "0px",
      marginTop: "10px",
    },
  },
  button: {
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
    },
  },
  icon: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  typo: {
    fontWeight: "bold",
    padding: "20px 0px",
    [theme.breakpoints.down("xs")]: {
      textAlign: "center",
    },
  },
  personal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      justifyContent: "center",
    },
  },
  container: {
    padding: "20px 120px 120px",
    [theme.breakpoints.down("md")]: {
      padding: "110px 66px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "5px 5px",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "5px 5px",
    },
  },
  nftImage: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    flexShrink: "0",
    maxWidth: "100%",
    marginTop: "auto",
    marginBottom: "auto",
  },
	nftVideo: {
		borderRadius: "16px",
	},
	nftIframe: {
    overflow: "hidden",
    position: "relative",
    flexShrink: "0",
    maxWidth: "100%",
		borderRadius: "16px",
		[theme.breakpoints.up("md")]: {
      height: "608px",
			width: "608px",
    },
		[theme.breakpoints.down("md")]: {
      height: "608px",
			width: "608px",
    },
		[theme.breakpoints.down("sm")]: {
      height: "365px",
			width: "365px",
    },
    [theme.breakpoints.down("xs")]: {
      height: "275px",
			width: "275px",
    },
	},
  iconsBorder: {
    border: "1px solid #E9ECEE",
    borderRadius: "5px",
  },
  div: {
    display: "flex",
    padding: "10px",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderBottom: "1px solid #E9ECEE",
    borderRadius: "5px",
  },
  heading: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: "bold",
    marginLeft : 20
  },
  removeNativeButtonStyles: {
    background: "none",
    padding: 0,
    margin: 0,
    border: "none",
    font: "inherit",
    color: "inherit",
    cursor: "pointer",
    textTransform: "inherit",
    textDecoration: "inherit",
    "-webkit-tap-highlight-color": "transparent",
  },
  nftDescWrapper: {
    [theme.breakpoints.up("sm")]: {
      padding: "0px 16px",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "0",
    },
  },
  nftDescHeader: {
    [theme.breakpoints.up("md")]: {
      margin: "16px 0"
    },
  },
  nftDesc: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("lg")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.down("xs")]: {
      justifyContent: "left",
    },
  },
  nftDescContainer1: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "8px",
    [theme.breakpoints.up("sm")]: {
      gap: "32px",
    },
    [theme.breakpoints.down("xs")]: {
      gap: "16px",
    },
  },
  nftDescContainer2: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "8px",
    [theme.breakpoints.up("sm")]: {
      gap: "40px",
    },
    [theme.breakpoints.down("xs")]: {
      gap: "16px",
    },
  },
  nftDescContainer3: {
    gap: "16px",
    [theme.breakpoints.up("md")]: {
      display: "flex",
      alignItems: "center",
    },
    [theme.breakpoints.down("md")]: {
      display: "grid",
    },
  },
  ownerWrapper: {
    ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
    wordBreak: "break-all",
  },
  ownerName: {
    ...cssToReactStyleObject(toniqFontStyles.boldParagraphFont),
    color: toniqColors.pageInteraction.foregroundColor,
  },
  ownerAddress: {
    ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
    cursor: "pointer",
    "&:hover": {
      color: toniqColors.pageInteraction.foregroundColor,      
    },
  },
  hoverText: {
    "&:hover": {
      color: toniqColors.pageInteraction.foregroundColor,      
    },
  },
  imageWrapper: {
    [theme.breakpoints.up("md")]: {
      display: "grid",
    },
    [theme.breakpoints.down("md")]: {
      display: "flex",
      justifyContent: "center",
    },
    "& div": {
      borderRadius: "16px",
    }
  },
  imageWrapperHistory: {
    [theme.breakpoints.up("md")]: {
      display: "grid",
    },
    [theme.breakpoints.down("md")]: {
      display: "flex",
      justifyContent: "center",
    },
    "& div, & iframe": {
      maxWidth: "64px",
      maxHeight: "64px",
      borderRadius: "8px",
    },
    
  },
  offerDesc: {
    display: "flex",
    justifyContent: "center",
		...cssToReactStyleObject(toniqFontStyles.paragraphFont),
  },
  attributeWrapper: {
    [theme.breakpoints.up("md")]: {
      marginTop: "16px",
      marginBottom: "16px"
    },
    [theme.breakpoints.down("md")]: {
      marginTop: "8px",
      marginBottom: "8px"
    },
  },
  attributeHeader: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F1F3F6",
    width: "100%",
    padding: "4px 0",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
  },
	accordionWrapper: {
		[theme.breakpoints.up("md")]: {
			margin: "32px 0",
		},
		[theme.breakpoints.down("md")]: {
			margin: "16px 0",
		},
	},
	nftCard: {
		[theme.breakpoints.up("md")]: {
			marginTop: "32px",
		},
		[theme.breakpoints.down("md")]: {
			marginTop: "16px",
		},
	},
  ntfCardContainer: {
    [theme.breakpoints.up("sm")]: {
      margin: "32px 0px",
		},
		[theme.breakpoints.down("sm")]: {
      margin: "16px 0px",
		},
  },
  tableHeader: {
    backgroundColor: "#F1F3F6",
    [theme.breakpoints.up("sm")]: {
			display: "flex",
      marginTop: "32px",
		},
		[theme.breakpoints.down("sm")]: {
			display: "none",
      marginTop: "0px",
		},
    padding: "8px 16px",
    borderRadius: "8px",
  },
  tableHeaderName: {
    textTransform: "uppercase",
    ...cssToReactStyleObject(toniqFontStyles.labelFont),
  },
  historyCard: {
    ...cssToReactStyleObject(toniqFontStyles.paragraphFont),
  },
  buyerMobile: {
    [theme.breakpoints.up("sm")]: {
			display: "none",
		},
		[theme.breakpoints.down("sm")]: {
			display: "flex",
		},
  },
  buyerDesktop: {
    [theme.breakpoints.up("sm")]: {
			visibility: "visible",
		},
		[theme.breakpoints.down("sm")]: {
			visibility: "hidden",
		},
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  }
}));

