import Reflux from "reflux";
import DlogsActions from "../action/DlogsActions";
import DLogsAPI from "../client/DLogsAPI"
import FileService from "../service/FileService";
import OptractService from "../service/OptractService";
import Mercury from '@postlight/mercury-parser';
import { toHexString } from "multihashes";


const fs = null

class DlogsStore extends Reflux.Store {
    constructor() {
        super();
        this.listenables = DlogsActions;
        this.ipfs = FileService.ipfs;
        this.ipfsClient = FileService.ipfsClient;
        this.opt = OptractService.opt;
        this.unlockRPC = OptractService.unlockRPC;
        

        this.state = {
            originalHashes:["QmfNaysDYn5ZCGcCSiGRDL4qxSHNWz5AXL7jw3MBj4e3qB"],

            articles : {
                '0xd09642642a4a091c7ee7d7def3b967c1f1231db25a61b4d4dd9de405dc816c7b':
                { url:
                   'https://www.economist.com/finance-and-economics/2019/08/01/the-fed-cuts-rates-for-the-first-time-in-over-a-decade',
                  txs:
                   [ '0xd71fd96d3ce7b7e9b045c8a05503075513d1dd73fe58e837fdb308693581ad55' ],
                  blk: [ 40 ],
                  cmt:
                   { '0xd71fd96d3ce7b7e9b045c8a05503075513d1dd73fe58e837fdb308693581ad55': 'QmfHdSESYPD8XyydWsNVf5QSBuog4PuBj7cf4xFM6XTXfw' },
                  page:
                   { title: 'The Fed cuts rates for the first time in over a decade',
                     author: null,
                     date_published: '2019-03-21T06:00:00.000Z',
                     dek: null,
                     lead_image_url:
                      'https://www.economist.com/sites/default/files/20190803_FND003.jpg',
                     content:
                      '<div class="blog-post__text"><p><span>I</span><small>NTEREST RATES</small> set by the Federal Reserve have been rising since 2015. The gradual approach, explained the Fed&#x2019;s chairman, Jerome Powell, last September, was intended to leave time to see how well the economy could absorb each raise. &#x201C;So far the economy has performed very well, and very much in keeping with our expectations,&#x201D; he said back then.</p><p>Now America is being treated to what some are calling &#x201C;Powell&#x2019;s pirouette&#x201D;. On July 31st Mr Powell announced America&#x2019;s first interest-rate cut in over a decade, of 0.25 percentage points (see chart). At the press conference after the announcement he blamed weak global growth, trade policy uncertainty and muted inflation. &#x201C;We&#x2019;re trying to sustain the expansion,&#x201D; he said.</p><div class="newsletter-form newsletter-form--inline"><div class="newsletter-form__message"><strong>Get our daily newsletter</strong><p>Upgrade your inbox and get our Daily Dispatch and Editor&apos;s Picks.</p></div></div><figure class=" blog-post__inline-image--slim blog-post__inline-image"><div class="component-image blog-post__image"><img src="https://www.economist.com/sites/default/files/20190803_FNC499.png" alt class="component-image__img blog-post-article-image__slim" srcset="https://www.economist.com/sites/default/files/imagecache/200-width/20190803_FNC499.png 200w, https://www.economist.com/sites/default/files/imagecache/300-width/20190803_FNC499.png 300w, https://www.economist.com/sites/default/files/imagecache/400-width/20190803_FNC499.png 400w, https://www.economist.com/sites/default/files/imagecache/640-width/20190803_FNC499.png 640w, https://www.economist.com/sites/default/files/imagecache/800-width/20190803_FNC499.png 800w, https://www.economist.com/sites/default/files/imagecache/1000-width/20190803_FNC499.png 1000w, https://www.economist.com/sites/default/files/imagecache/1200-width/20190803_FNC499.png 1200w, https://www.economist.com/sites/default/files/imagecache/1280-width/20190803_FNC499.png 1280w, https://www.economist.com/sites/default/files/imagecache/1600-width/20190803_FNC499.png 1600w" sizes="(min-width: 600px) 640px, calc(100vw - 20px)"></div></figure><p>The move was widely expected, though not universally understood. By many measures America&#x2019;s economy still seems buoyant. After dipping a little, earlier in the year, consumer confidence is almost back to its post-recovery peak. Figures published on July 26th revealed that Americans are still spending enthusiastically. Some recent risks have subsided, notably those to do with the public finances. On July 22nd politicians agreed on a deal to raise America&#x2019;s debt limit, and to avoid steep spending cuts. According to Oxford Economics, a consultancy, had they failed, the squeeze could have knocked 0.4 percentage points off real <small>GDP</small> growth.</p><figure></figure><p>But businesses do not appear to share consumers&#x2019; confidence. Non-residential investment shrank in the second quarter of the year. Residential investment has fallen for six consecutive quarters. According to the Federal Reserve Bank of New York, investors are pricing government debt at a level that has historically been associated with a one-in-three chance of a recession within 12 months.</p><p>President Donald Trump&#x2019;s trade war shows no signs of abating. The effects of the latest increase in tariffs, in mid-June, will take a few more months to become fully apparent in the data. On July 18th the <small>IMF</small> updated its World Economic Outlook, citing &#x201C;subdued&#x201D; global growth and a &#x201C;precarious&#x201D; projected pickup in 2020. Moreover, some of the economy&#x2019;s recent resilience may have been in the expectation of the cut to come. Financial conditions have become looser since January, when Fed officials first signalled that they would be pausing interest-rate increases. Mortgage rates have also fallen since then.</p><p>Finally, as Mr Powell emphasised on July 31st, inflation is uncomfortably weak. On a measure that excludes volatile food and energy prices, it sagged to 1.6% in June, well below the Fed&#x2019;s 2% target. That has paved the way for members of the Fed&#x2019;s rate-setting committee to adjust the path of interest rates downwards and to implement an &#x201C;insurance cut&#x201D;&#x2014;a tactical reduction intended to keep the expansion alive. With interest rates so low, there is little room for an aggressive move. Rate-setters hope that a small and speedy cut will mean one will not be needed.</p><p>As Mr Powell finished speaking on July 31st, market prices reflected a 73% chance of a further cut of 0.25 percentage points this year. But he studiously avoided committing to anything more, saying that any further cuts would depend on both incoming data and &#x201C;evolving risks to the outlook&#x201D;.</p><p>A further cut would not be universally welcome. Catherine Mann of Citigroup, a bank, is sceptical that the latest round of monetary easing will boost business confidence enough to rekindle investment. The Trump administration&#x2019;s trade policy, not the cost of capital, is holding businesses back, she thinks. She fears that the Fed may be causing asset prices and the broader economy to move apart, generating risks to financial stability.</p><p>Nonetheless investors could react badly if Mr Powell fails to meet their expectations, warns Neil Shearing of Capital Economics, a consultancy. A strengthening dollar, wobbling equity markets or tightening credit conditions could then bounce the Fed into a further burst of loosening.</p><p>America&#x2019;s monetary-policymakers also need to consider the actions of other countries&#x2019; central banks, which have already started to ease. Julia Coronado of MacroPolicy Perspectives, a consultancy, points out that there are limits to how much the Fed can depart from the global trend before it starts causing problems in capital markets. Too much divergence and the dollar will strengthen, tightening supplies of dollar credit and further crimping global trade. Mr Powell has executed a fine pirouette. But he is going to need even more fancy footwork in the coming year. <span>&#x25A0;</span></p></div>',
                     next_page_url: null,
                     url:
                      'https://www.economist.com/finance-and-economics/2019/08/01/the-fed-cuts-rates-for-the-first-time-in-over-a-decade',
                     domain: 'www.economist.com',
                     excerpt: 'Investors are already hankering for more',
                     word_count: 723,
                     direction: 'ltr',
                     total_pages: 1,
                     rendered_pages: 1 },
                  tags: { tags: ["tech"], comment: 'send by 11be bot' } }
            },
            following: [],
            displayBlogs: [],
            onlyShowForBlogger: "",
            currentBlogContent: "",
            login: false,
            logining: false,
            account: "",
            memberShipStatus: "active",
            address: "0xaf7400787c54422be8b44154b1273661f1259ccd",
            passManaged : ["0xaf7400787c54422be8b44154b1273661f1259ccd"],
            activeTabKey : "finalList",
            curentBlockNO : 41,
            showVoteToaster: false

        }

    }

    initializeState = () => {

    }


    onFetchBlogContent = (article) => {
        this.setState({ currentBlogContent: article.page.content });
        // Mercury.parse(url, {
        //   }).then(r => {
        //     this.setState({ currentBlogContent: r.content });
        // })
    }

    
    onUnlock = (pw) => {
        this.setState({logining : true});
        this.unlockRPC(pw, this.unlocked);   
    }

    unlocked = ()=>{
        this.setState({ login: true, logining : false })
    }

    onUpdateState = (state) =>{
        this.setState(state);
    }

    // onRefresh = () => {
    //     this.setState({ blogs: [] });
    //     this.initializeState();
    // }

    onUpdateTab = activeKey =>{
        let state ={activeTabKey: activeKey};
        if(this.state.newArticles){
            state = {...state, articles: this.state.newArticles, newArticles : nulll};
        }
        if(this.state.newClaimArticles){
            state = {...state, claimArticles: this.state.newClaimArticles, newClaimArticles : nulll};
        }
        this.setState(state);

    } 

    onVote(block, leaf){
        OptractService.newVote(block, leaf).then(data =>{
            console.dir(data);
            this.setState({showVoteToaster: true})
        });
    }

    onCloseToast(){
        this.setState({showVoteToaster: false})
    }


}


DlogsStore.id = "DlogsStore"

export default DlogsStore;
