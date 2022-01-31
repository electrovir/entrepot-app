/* global BigInt */
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import React from 'react';
import {useParams} from 'react-router';
import Timestamp from 'react-timestamp';
import extjs from '../../ic/extjs.js';
const api = extjs.connect('https://boundary.ic0.app/');
const perPage = 60;
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
const _showListingPrice = (n) => {
    n = Number(n) / 100000000;
    return n.toFixed(8).replace(/0{1,6}$/, '');
};
const _getRandomBytes = () => {
    var bs = [];
    for (var i = 0; i < 32; i++) {
        bs.push(Math.floor(Math.random() * 256));
    }
    return bs;
};
export default function DfinityBulls(props) {
    const [page, setPage] = React.useState(1);
    const [price, setPrice] = React.useState(50000000n);
    const [remaining, setRemaining] = React.useState(false);
    const [startTime, setStartTime] = React.useState(1636207200000);
    const [whitelist, setWhitelist] = React.useState(false);
    var whitelistend = 1636293600000;
    var presaleprice = 80000000n;
    var saleOver = false;
    const params = useParams();

    const _updates = async () => {
        var stats = await api
            .canister('dknxi-2iaaa-aaaah-qceuq-cai', 'sale')
            .salesStats(props.account ? props.account.address : '');
        setStartTime(Number(stats[0] / 1000000n));
        if (stats[1] == presaleprice) {
            setWhitelist(true);
        }
        setRemaining(Number(stats[2]));
    };
    const theme = useTheme();
    const classes = useStyles();
    const styles = {
        main: {
            maxWidth: 1200,
            margin: '0 auto',
            textAlign: 'center',
            minHeight: 'calc(100vh - 221px)',
        },
    };
    const buyFromSale = async (qty, price) => {
        if (props.balance < price + 10000n) {
            return props.alert(
                'There was an error',
                'Your balance is insufficient to complete this transaction',
            );
        }
        var v = await props.confirm(
            'Please confirm',
            'Are you sure you want to continue with this purchase of ' +
                qty +
                ' NFT' +
                (qty === 1 ? '' : 's') +
                ' for the total price of ' +
                _showListingPrice(price) +
                " ICP. All transactions are final on confirmation and can't be reversed.",
        );
        if (!v) return;
        try {
            if (qty === 1) {
                props.loader(true, 'Reserving Bull...');
            } else {
                props.loader(true, 'Reserving Bullss..');
            }
            const api = extjs.connect('https://boundary.ic0.app/', props.identity);
            var r = await api
                .canister('dknxi-2iaaa-aaaah-qceuq-cai', 'sale')
                .reserve(price, qty, props.account.address, _getRandomBytes());
            if (r.hasOwnProperty('err')) {
                throw r.err;
            }
            var paytoaddress = r.ok[0];
            var pricetopay = r.ok[1];
            props.loader(true, 'Transferring ICP...');
            await api
                .token()
                .transfer(
                    props.identity.getPrincipal(),
                    props.currentAccount,
                    paytoaddress,
                    pricetopay,
                    10000,
                );
            var r3;
            while (true) {
                try {
                    props.loader(true, 'Completing purchase...');
                    r3 = await api
                        .canister('dknxi-2iaaa-aaaah-qceuq-cai', 'sale')
                        .retreive(paytoaddress);
                    if (r3.hasOwnProperty('ok')) break;
                } catch (e) {}
            }
            props.loader(false);
            props.alert(
                'Transaction complete',
                'Your purchase was made successfully - your NFT will be sent to your address shortly',
            );
            _updates();
        } catch (e) {
            props.loader(false);
            props.alert(
                'There was an error',
                e.Other ??
                    (typeof e == 'string'
                        ? e
                        : 'You may need to enable cookies or try a different browser'),
            );
        }
    };
    useInterval(_updates, 5 * 1000);
    React.useEffect(() => {
        _updates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var buyOptions = [
        [1, 50000000n],
        [5, 250000000n],
        [10, 500000000n],
        [20, 800000000n],
    ];
    return (
        <>
            <div style={styles.main}>
                <div className={classes.banner}>
                    <div
                        style={{
                            width: '100%',
                            height: 200,
                            borderRadius: 10,
                            backgroundPosition: 'top',
                            backgroundSize: 'cover',
                            backgroundImage: "url('/collections/bulls/banner.png')",
                        }}
                    ></div>
                    <h1>Welcome to the official Dfinity Bulls sale</h1>
                </div>
                <Grid
                    justifyContent="center"
                    direction="row"
                    alignItems="center"
                    container
                    spacing={2}
                    style={{}}
                >
                    <Grid className={classes.stat} item md={4} xs={6}>
                        <strong>AVAILABLE</strong>
                        <br />
                        <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '2em'}}>
                            {remaining !== false ? remaining : 'Loading...'}
                        </span>
                    </Grid>
                    <Grid className={classes.stat} item md={4} xs={6}>
                        <strong>SALE PRICE</strong>
                        <br />
                        <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '2em'}}>
                            {_showListingPrice(price)} ICP
                        </span>
                    </Grid>
                    <Grid className={classes.stat} item md={4} xs={6}>
                        <strong>SOLD</strong>
                        <br />
                        <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '2em'}}>
                            {remaining !== false ? 8000 - remaining : 'Loading...'}
                        </span>
                    </Grid>
                </Grid>
                <br />
                <br />
                {remaining === false ? (
                    <>
                        <p>
                            <strong>
                                <span style={{fontSize: '20px', color: 'black'}}>Loading...</span>
                            </strong>
                        </p>
                    </>
                ) : (
                    <>
                        {!saleOver && remaining > 0 ? (
                            <>
                                {whitelist ? (
                                    <>
                                        <p>
                                            <strong>
                                                <span style={{fontSize: '20px', color: 'black'}}>
                                                    You are on the whitelist! You can mint 1 NFT at
                                                    0.8ICP for the first 24 hours only!
                                                </span>
                                            </strong>
                                        </p>
                                    </>
                                ) : (
                                    ''
                                )}
                                {Date.now() >= startTime ? (
                                    <>
                                        <Grid
                                            justifyContent="center"
                                            direction="row"
                                            alignItems="center"
                                            container
                                            spacing={2}
                                            style={{}}
                                        >
                                            {whitelist ? (
                                                <Button
                                                    variant={'contained'}
                                                    color={'primary'}
                                                    onClick={() => buyFromSale(1, presaleprice)}
                                                    style={{fontWeight: 'bold', margin: '0 auto'}}
                                                >
                                                    Buy 1 Dfinity Bull
                                                    <br />
                                                    for {_showListingPrice(presaleprice)} ICP
                                                </Button>
                                            ) : (
                                                buyOptions.map((o) => {
                                                    return (
                                                        <Grid className={classes.stat} item sm={3}>
                                                            <Button
                                                                variant={'contained'}
                                                                color={'primary'}
                                                                onClick={() =>
                                                                    buyFromSale(o[0], o[1])
                                                                }
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    margin: '0 auto',
                                                                }}
                                                            >
                                                                Buy {o[0]} Dfinity Bull
                                                                {o[0] === 1 ? '' : 's'}
                                                                <br />
                                                                for {_showListingPrice(o[1])} ICP
                                                            </Button>
                                                        </Grid>
                                                    );
                                                })
                                            )}
                                        </Grid>
                                        <p>
                                            <strong>Please note:</strong> All transactions are
                                            secured via Entrepot's escrow platform. There are no
                                            refunds or returns, once a transaction is made it can
                                            not be reversed. Entrepot provides a transaction service
                                            only. By clicking one of the buttons above you show
                                            acceptance of our{' '}
                                            <a
                                                href="https://docs.google.com/document/d/13aj8of_UXdByGoFdMEbbIyltXMn0TXHiUie2jO-qnNk/edit"
                                                target="_blank"
                                            >
                                                Terms of Service
                                            </a>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            <strong>
                                                <span style={{fontSize: '20px', color: 'black'}}>
                                                    The public sale starts{' '}
                                                    <Timestamp
                                                        relative
                                                        autoUpdate
                                                        date={startTime / 1000}
                                                    />
                                                    !
                                                </span>
                                            </strong>
                                        </p>
                                    </>
                                )}
                            </>
                        ) : (
                            <p>
                                <strong>
                                    <span style={{fontSize: '20px', color: 'red'}}>
                                        Sorry, the sale is now over! You can grab your Dfinity Bull
                                        from the marketplace soon!
                                    </span>
                                </strong>
                            </p>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

const useStyles = makeStyles((theme) => ({
    walletBtn: {
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    stat: {
        span: {
            fontSize: '2em',
        },
    },
    content: {
        flexGrow: 1,
        marginTop: 73,
        marginLeft: 0,
        [theme.breakpoints.up('sm')]: {
            marginLeft: 300,
        },
    },
}));
