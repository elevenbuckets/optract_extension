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
        

        this.dlogs = new DLogsAPI(null, null,
            {
                "appName": "DLogs",
                "artifactDir": null,
                "conditionDir": null,
                "contracts": [{ "ctrName": "DLogs", "conditions": ["Sanity"] }],
                "networkID": 4,
                "version": "1.0"
            }
        );

        // this.dlogs.ipfsId()
        //     .then((o) => {
        //         console.log(JSON.stringify(o, 0, 2))
        //         this.initializeState();
        //     });

        this.state = {
            originalHashes:["QmfNaysDYn5ZCGcCSiGRDL4qxSHNWz5AXL7jw3MBj4e3qB"],
            // articles: [
            //     {title: "test", tag:"tech", TLDR: "<p>This is TLDR</p>", url: "https://medium.com/front-end-weekly/react-without-webpack-a-dream-come-true-6cf24a1ff766"},
            //     {title: "Blog2", tag:"tech", TLDR: "<p>This is Blog 2 TLDR</p>", url: "https://www.blog.google/products/maps/helping-businesses-capture-their-identity-google-my-business/"},
            //     {title: "Bakkt Is Scheduled to Start Testing Its Bitcoin Futures Contracts Today",
            //      tag:"blockchain", TLDR: "<p>Bakkt is scheduled to begin testing its bitcoin futures contracts Monday, more than six months after its originally planned launch date. </p>",
            //      url: "https://www.coindesk.com/bakkt-is-supposed-to-start-testing-its-bitcoin-futures-contracts-today"},
            //      {title: "Tech stocks lead US indexes higher on earnings optimism",
            //      tag:"finance", TLDR: "<p>Major US indexes closed higher on Monday, led by tech stocks that climbed ahead of highly anticipated earnings reports later this week. </p>",
            //      url: "https://markets.businessinsider.com/news/stocks/stock-market-news-tech-stocks-climb-ahead-of-earnings-2019-7-1028373243"},

            // ],

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
                  tags: { tags: ["tech"], comment: 'send by 11be bot' } },
               '0xdf6fff441a5ba944b909597fc385996fed6f48bc75d7ebd0a9045b5818545561':
                { url:
                   'https://www.theblockcrypto.com/tiny/samsung-quietly-adds-support-for-bitcoin-to-its-blockchain-keystore/?utm_source=rss&utm_medium=rss&utm_campaign=default',
                  txs:
                   [ '0xfbf261cc42b899599598e22b9342e7e74fc90b1740bd8a48b19b7bc573baac2e' ],
                  blk: [ 40 ],
                  cmt:
                   { '0xfbf261cc42b899599598e22b9342e7e74fc90b1740bd8a48b19b7bc573baac2e': 'QmYRbDamJNj8PJ1jGv7UubdjcTa4UJjLb5ZhukFizoGyWH' },
                  page:
                   { title:
                      'Samsung quietly adds support for bitcoin to its Blockchain Keystore',
                     author: null,
                     date_published: null,
                     dek: null,
                     lead_image_url:
                      'https://www.tbstat.com/wp/uploads/2019/07/Samsung-Galaxy-S10.jpg',
                     content:
                      '<body class="tiny-template-default single single-tiny postid-35895 group-blog tiny-samsung-quietly-adds-support-for-bitcoin-to-its-blockchain-keystore "> <p class="py-5"> <footer> <div class="container m-auto"> <div class="row mt-3"> <div class="col"> <p class="copyright text-center text-uppercase"> <strong>&#xA9; 2019 the block. all rights reserved.</strong> </p> <p class="copyright text-center"> <a class="theme color-white text-uppercase" href="/privacy-policy">privacy policy</a> <span><strong>&#xA0;&#x2022;&#xA0;</strong></span> <a class="theme color-white text-uppercase" href="/terms-service">terms of service</a> </p> </div> </div> </div> </footer>\n</p> </body>',
                     next_page_url: null,
                     url:
                      'https://www.theblockcrypto.com/tiny/samsung-quietly-adds-support-for-bitcoin-to-its-blockchain-keystore/',
                     domain: 'www.theblockcrypto.com',
                     excerpt:
                      'South Korean electronics giant Samsung has silently added support for bitcoin to its Blockchain Keystore, an online decentralized applications (dapps) store. Earlier, supporting only Ethereum&hellip;',
                     word_count: 13,
                     direction: 'ltr',
                     total_pages: 1,
                     rendered_pages: 1 },
                  tags: { tags: [Array], comment: 'ok' } },
               '0xe30d7a0334866905c11ea494654b908530ac0bd320dc6107d4bb85526aea9d75':
                { url:
                   'https://hackernoon.com/insiders-guide-how-to-find-evaluate-and-hire-ux-designers-5q2fk30xz?source=rss',
                  txs:
                   [ '0xabbe6bc2460f816c9631c887021f665f639068730a548a6f1dd858bac3446e18' ],
                  blk: [ 40 ],
                  cmt:
                   { '0xabbe6bc2460f816c9631c887021f665f639068730a548a6f1dd858bac3446e18': 'QmTVLBNLRmgs2MPUPpioCUGTjwnUTCpFR2nUx7ZP4BuiaG' },
                  page:
                   { title: 'The Complete Guide to Hiring Outstanding UX Designers',
                     author: null,
                     date_published: null,
                     dek: null,
                     lead_image_url: 'https://hackernoon.com/drafts/ie2bn30us.png',
                     content:
                      '<div class="content"> <img src="https://hackernoon.com/drafts/ie2bn30us.png"> <p class="paragraph">Anyone who has gone through the process of looking for, evaluating, and hiring UX designers will tell you that it&#x2019;s not easy. First, you need to find UX designers, then you need to evaluate them against structured criteria, and then finally, you need to convince them to join your payroll. Of course, all that is easier said than done.</p><p class="paragraph">To make sure you get through this process as smoothly as possible, you&#x2019;ll want all the help you can get.</p><p class="paragraph">Here&#x2019;s an insider&#x2019;s guide on how to find, evaluate, and hire UX designers successfully.</p><div class="image-container"><img src="https://hackernoon.com/photos/OxDZqJ0cVxaHHrjSfMFhvMB6LQj1-ukfn30kr" alt></div><p class="paragraph">Targeted outreach is one of the most effective ways to find a great UX designer, especially if you have a team that has worked with &#x2014; or knows someone who has worked with &#x2014; designers in the past. As the name suggests, targeted outreach means you need to make the first move and contact prospective designers.</p><p class="paragraph">Sit down with your team and brainstorm a few names. Create a list of UX designers and start reaching out to them. If they&#x2019;re too busy or not interested, ask them to refer someone else. Essentially, targeted outreach is based on referrals, so you can rest assured knowing that you&#x2019;ll find someone with relevant experience and expertise.</p><div class="image-container"><img src="https://hackernoon.com/photos/OxDZqJ0cVxaHHrjSfMFhvMB6LQj1-0hgv30tf" alt></div><p class="paragraph">There are plenty of online communities where UX designers can show off their designs and share portfolios. Here, you can find skilled UX designers from all around the world, browse endless designs, and even post a job with your specific requirements.</p><p class="paragraph">Keep in mind that while these online communities are an awesome place to screen visual designs, they&#x2019;re not particularly useful when it comes to understanding the strategy, vision, interaction, or architecture used by the designers to build the final product. Namely, you get a glimpse of the surface but not what is beneath it.</p><blockquote><p class="paragraph"><em>&#x201D;A beautiful product that doesn&#x2019;t work very well is ugly.&#x201D;</em></p><p class="paragraph"><em>&#x2014; Jonathan Ive</em></p></blockquote><p class="paragraph">For this reason, it&#x2019;s important that you know exactly what you want and need from your UX designer. Otherwise, you might end up finding a UX designer who excels in creativity but is lacking in the strategic department.</p><p class="paragraph">Prominent online UX design communities include Dribbble, Behance, Coroflot, and Awwwards.</p><p class="paragraph">Even though you can post your UX design job post on any job search engine, it&#x2019;s best to post on job boards that specialize in UX design. This way, you can be certain that your post will target and reach the right audience: UX designers.</p><p class="paragraph">Here are UX job boards where you can find your ideal UX designer:</p><p class="paragraph"><strong>UX Jobs Board</strong></p><p class="paragraph"><strong>Toptal</strong></p><p class="paragraph"><strong>Just UX Jobs</strong></p><p class="paragraph"><strong>Designer Hangout</strong></p><p class="paragraph"><strong>Authentic Jobs</strong></p><div class="image-container"><img src="https://hackernoon.com/photos/OxDZqJ0cVxaHHrjSfMFhvMB6LQj1-axi130k6" alt></div><p class="paragraph">When you find a UX designer who seems like a good fit, it&#x2019;s time to put them to the test and evaluate them. How do you do this? Everyone has their own methods, but most interviewers just go with their gut feeling. This is wrong. Your instincts &#x2014; or innate biases &#x2014; should not be the main selection criterion for a UX designer.</p><blockquote><p class="paragraph"><em>You have to know what you want in a UX designer. What is good depends on a candidate&#x2019;s matching the competencies that you&#x2019;ve chosen, at the levels of proficiency that you need.&#x201D;</em></p><p class="paragraph"><em>&#x2014; Nathaniel Davis</em></p></blockquote><p class="paragraph">Instead, you should develop valid selection criteria to make the evaluation &#x2014; and ultimately, the selection &#x2014; more accurate.</p><p class="paragraph">To objectively evaluate UX designers, follow these four steps:</p><p class="paragraph"><strong>1. Know what you want.</strong>&#xA0;Define the specs of your project and design requirements.</p><p class="paragraph"><strong>2. Evaluate hard skills.</strong>&#xA0;What skills are vital to the successful completion of the project?</p><p class="paragraph"><strong>3. Explore soft skills.</strong>&#xA0;What personal attributes does the designer possess</p><p class="paragraph"><strong>4. Test UX designers.</strong>&#xA0;Can they create a viable design solution that satisfies expectations?</p><p class="paragraph">Additionally, you want your criteria to feature various qualities and skills that are essential to your project. This will ensure that the UX designer can easily adjust and contribute to your team.</p><p class="paragraph">Here&#x2019;s what to look for when hiring a UX designer:</p><p class="paragraph"><strong>What do you want to find out?</strong>&#xA0;Can this UX designer do the job efficiently?</p><p class="paragraph"><strong>How can you find out?</strong>&#xA0;Review portfolio, ask questions, and give design exercises.</p><p class="paragraph"><strong>Experience.&#xA0;</strong>Do they have sufficient experience in UX design?</p><p class="paragraph"><strong>Problem setting.</strong>&#xA0;Can they identify, question, and prioritize problems?</p><p class="paragraph"><strong>User-centered process.</strong>&#xA0;Do they base their design decisions on user insights?</p><p class="paragraph"><strong>Idea generation.</strong>&#xA0;Are they able to quickly generate high-quality solutions?<strong>Systems thinking.</strong>&#xA0;Do they understand how their solution will fit into users&#x2019; lives?</p><p class="paragraph"><strong>Visual appeal.</strong>&#xA0;Is their design appropriate for the audience?</p><p class="paragraph"><strong>Innovation.</strong>&#xA0;Does their design feel new and original?#</p><p class="paragraph"><strong>What do you want to find out?</strong>&#xA0;Do I want to work with this designer?</p><p class="paragraph"><strong>How can you find out?</strong>&#xA0;One-on-one interviews, cover letters, and back-and-forth emails.</p><p class="paragraph"><strong>Communication.</strong>&#xA0;Are they a good listener and a persuasive speaker?</p><p class="paragraph"><strong>Collaboration.</strong>&#xA0;Can they work efficiently as part of a team?</p><p class="paragraph"><strong>Cultural contribution.</strong>&#xA0;Do they represent your company&#x2019;s values?</p><p class="paragraph"><strong>Leadership.</strong>&#xA0;Do they take proud ownership of their work and decisions</p><p class="paragraph"><strong>Mission.</strong>&#xA0;Did they read up on your company prior to the interview?</p><p class="paragraph">UX designers that possess these skills are definitely worth considering for the job.</p><p class="paragraph">If you&#x2019;re stuck on finding the right questions to ask UX designers during interviews, here are a few that will give you the information you need to make the final decision:</p><p class="paragraph">Describe your design process and methods.Describe the challenges you faced on a recent project.How did you approach the problem?Provide examples of how you deal with user research and usability testing.How do you handle criticism from clients?What does it mean to be a great UX designer?What analytical tools do you use to evaluate your designs?</p><div class="image-container"><img src="https://hackernoon.com/photos/OxDZqJ0cVxaHHrjSfMFhvMB6LQj1-6m1et30ua" alt></div><p class="paragraph">When looking for the right UX designer, companies often make mistakes that end up blowing up in their faces. Make sure to avoid these common mistakes when hiring UX designers:</p><p class="paragraph"><strong>Merge separate roles.</strong>&#xA0;Do not expect a UX designer to perform a wide range of tasks outside their professional domain, like UI, marketing, and QA. If you&#x2019;re looking for a great UX designer, stick to looking for someone who&#x2019;s just that.</p><p class="paragraph"><strong>Judge a UX portfolio on quantity.</strong>&#xA0;Do not make the assumption that a UX designer with only a handful of samples in their portfolio is any less experienced than someone with 20 samples. Focus on what&#x2019;s inside the portfolio, and put an emphasis on quality over quantity.</p><p class="paragraph"><strong>Expect a fast turnaround.</strong>&#xA0;Do not set unrealistic deadlines and rush a UX designer. This will do you more harm than good. Great UX design takes time. Accept it. Give the designer enough time to do their job properly, or risk cutting your product&#x2019;s chances of success.</p><p class="paragraph"><strong>Posting a mediocre job ad.</strong>&#xA0;Do not reach out to UX designers with a boring job ad. Create one that will stand out from the crowd and spark interest. Share your company story, promote your work culture, and present your vision in a way that will leave a positive impression.</p><p class="paragraph"><strong>Ignore the competitive UX market.&#xA0;</strong>Do not think that UX designers are a dime a dozen. They&#x2019;re not. UX is an extremely competitive market. This means you should think of ways to motivate and retain top UX talent even before you acquire it.</p><p class="paragraph">Finding, evaluating, and hiring a UX designer is not the easiest task. There&#x2019;s no denying that. But with the right approach and can-do attitude, you can find a great UX designer to join your team.</p> </div>',
                     next_page_url: null,
                     url:
                      'https://adamfard.com/ux-design-blog/insiders-guide-how-to-find-evaluate-and-hire-ux-designers/',
                     domain: 'adamfard.com',
                     excerpt:
                      'Anyone who has gone through the process of looking for, evaluating, and hiring UX designers will tell you that it’s not easy. First, you need to find UX designers, then you need to evaluate them&hellip;',
                     word_count: 1166,
                     direction: 'ltr',
                     total_pages: 1,
                     rendered_pages: 1 },
                  tags: { tags: ["finance"], comment: 'send by 11be bot' } } 
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

        }

    }

    initializeState = () => {



        // let Max = 10;
        // let blogs = [];
        // let count = 0;
        // this.dlogs.allAccounts().then((addr) => {
        //     return this.dlogs.linkAccount(addr[0]).then(r => {
        //         if (r.result) {
        //             this.setState({ login: true, account: this.dlogs.getAccount() })
        //         }
        //     })
        // }).then(() => {
        //     this.dlogs.browse(0, Max).then((helper) => {
        //         helper.map((value, index) => {
        //             let ipns = value.ipnsHash;
        //             this.dlogs.pullIPNS(ipns).then(metaJSON => {
        //                 let tempBlogs = Object.keys(metaJSON.Articles).map(hash => {
        //                     return { ...metaJSON.Articles[hash], ipfsHash: hash }
        //                 })
        //                 blogs = [...blogs, ...tempBlogs];
        //                 count = count + 1;
        //                 // if (count == helper.length) {
        //                 this.setState({ blogs: blogs });
        //                 // }
        //             }).catch((e) => {
        //                 count = count + 1;
        //                 // if (count == helper.length) {
        //                 this.setState({ blogs: blogs });
        //                 // }
        //             })
        //         });
        //     })
        // })
       

    }

    // getBlogOnlyShowForBloger = () => {
    //     this.dlogs.lookUpByAddr(this.state.onlyShowForBlogger).then((ipns) => {
    //         this.dlogs.pullIPNS(ipns).then(metaJSON => {
    //             let blogs = Object.keys(metaJSON.Articles).map(hash => {
    //                 return { ...metaJSON.Articles[hash], ipfsHash: hash }
    //             })
    //             this.setState({ blogs: blogs })
    //         })
    //     })
    // }


    onFetchBlogContent = (article) => {
        this.setState({ currentBlogContent: article.page.content });
        // Mercury.parse(url, {
        //   }).then(r => {
        //     this.setState({ currentBlogContent: r.content });
        // })
    }

    // onSaveNewBlog = (title, TLDR, content) => {
    //     // let tempFile = "/tmp/.tempBlog";
    //     // let tempIPNSFile = "/tmp/.ipns.json";

    //     // fs.writeFileSync(tempFile, content, 'utf8');
    //     // this.dlogs.lookUpByAddr(this.dlogs.getAccount()).then((ipns) => {
    //     //     this.dlogs.ipfsPut(tempFile).then(r => {
    //     //         this.dlogs.pullIPNS(ipns).then(metaJSON => {
    //     //             let newArticle = { title, author: this.dlogs.getAccount(), timestamp: Date.now(), TLDR, };
    //     //             let newJSON = { ...metaJSON };
    //     //             newJSON.Articles = { ...newJSON.Articles, [r[0].hash]: newArticle };
    //     //             fs.writeFileSync(tempIPNSFile, JSON.stringify(newJSON), 'utf8');
    //     //             this.dlogs.ipfsPut(tempIPNSFile).then(r => {
    //     //                 this.dlogs.ipnsPublish(r[0].hash).then((rc) => {
    //     //                     fs.unlinkSync(tempFile);
    //     //                     fs.unlinkSync(tempIPNSFile);
    //     //                 })
    //     //             })
    //     //         })
    //     //     })
    //     // })

    //     this.ipfsClient.add([Buffer.from(content)], (err, filesAdded) => {
    //         if (err) { throw err }
    
    //         const hash = filesAdded[0].hash
    //         this.setState({ added_file_hash: hash })
    //         this.ipfs.cat(hash, (err, data) => {
    //             if (err) { throw err }
    //             let title = "This is blog " + this.state.blogs.length;
    //             let TLDR = data.toString()
    //             let blog = {title, TLDR }
    //             let blogs = [...this.state.blogs, blog]
    //             this.setState({ added_file_contents: data.toString(), blogs : blogs})
    //           })
    //     })
    // }

    // onDeleteBlog = (ipfsHash) => {
    //     let tempIPNSFile = "/tmp/.ipns.json";
    //     this.dlogs.lookUpByAddr(this.dlogs.getAccount()).then((ipns) => {
    //         this.dlogs.pullIPNS(ipns).then(metaJSON => {
    //             let newJSON = { ...metaJSON };
    //             let articles = newJSON.Articles;
    //             articles[ipfsHash] = undefined;
    //             newJSON.Articles = articles;
    //             fs.writeFileSync(tempIPNSFile, JSON.stringify(newJSON), 'utf8');
    //             this.dlogs.ipfsPut(tempIPNSFile).then(r => {
    //                 this.dlogs.ipnsPublish(r[0].hash).then((rc) => {
    //                     fs.unlinkSync(tempIPNSFile);
    //                 })
    //             })
    //         })
    //     })
    // }


    // onEditBlog = (title, TLDR, content, ipfsHash) => {
    //     let tempFile = "/tmp/.tempBlog";
    //     let tempIPNSFile = "/tmp/.ipns.json";

    //     fs.writeFileSync(tempFile, content, 'utf8');
    //     this.dlogs.lookUpByAddr(this.dlogs.getAccount()).then((ipns) => {
    //         this.dlogs.ipfsPut(tempFile).then(r => {
    //             console.log(r);
    //             this.dlogs.pullIPNS(ipns).then(metaJSON => {
    //                 let newArticle = { title, author: this.dlogs.getAccount(), timestamp: Date.now(), TLDR, };
    //                 let newJSON = { ...metaJSON };
    //                 let articles = newJSON.Articles;
    //                 articles[ipfsHash] = undefined;
    //                 newJSON.Articles = articles;
    //                 newJSON.Articles = { ...newJSON.Articles, [r[0].hash]: newArticle };
    //                 fs.writeFileSync(tempIPNSFile, JSON.stringify(newJSON), 'utf8');
    //                 this.dlogs.ipfsPut(tempIPNSFile).then(r => {
    //                     this.dlogs.ipnsPublish(r[0].hash).then((rc) => {
    //                         fs.unlinkSync(tempFile);
    //                         fs.unlinkSync(tempIPNSFile);
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // }

    onUnlock = (pw) => {
        this.setState({logining : true});
        this.unlockRPC(pw, this.unlock,0);   
    }

    unlock = ()=>{
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


}


DlogsStore.id = "DlogsStore"

export default DlogsStore;
