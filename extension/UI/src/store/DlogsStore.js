import Reflux from "reflux";
import DlogsActions from "../action/DlogsActions";
import DLogsAPI from "../client/DLogsAPI"
import FileService from "../service/FileService";
import Mercury from '@postlight/mercury-parser';


const fs = null

class DlogsStore extends Reflux.Store {
    constructor() {
        super();
        this.listenables = DlogsActions;
        this.ipfs = FileService.ipfs;
        this.ipfsClient = FileService.ipfsClient;
        

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
            blogs: [
                {title: "test", TLDR: "<p>This is TLDR</p>", url: "https://medium.com/front-end-weekly/react-without-webpack-a-dream-come-true-6cf24a1ff766"},
                {title: "Blog2", TLDR: "<p>This is Blog 2 TLDR</p>", url: "https://www.blog.google/products/maps/helping-businesses-capture-their-identity-google-my-business/"}
            ],
            following: [],
            displayBlogs: [],
            onlyShowForBlogger: "",
            currentBlogContent: "",
            login: false,
            account: ""

        }

    }

    initializeState = () => {
        let Max = 10;
        let blogs = [];
        let count = 0;
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

    getBlogOnlyShowForBloger = () => {
        this.dlogs.lookUpByAddr(this.state.onlyShowForBlogger).then((ipns) => {
            this.dlogs.pullIPNS(ipns).then(metaJSON => {
                let blogs = Object.keys(metaJSON.Articles).map(hash => {
                    return { ...metaJSON.Articles[hash], ipfsHash: hash }
                })
                this.setState({ blogs: blogs })
            })
        })
    }


    onFetchBlogContent = (url) => {
        this.setState({ currentBlogContent: "" });
        Mercury.parse(url, {
            headers: {
              Cookie: 'name=value; name2=value2; name3=value3',
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
            },
          }).then(r => {
            this.setState({ currentBlogContent: r.content });
        })
    }

    onSaveNewBlog = (title, TLDR, content) => {
        // let tempFile = "/tmp/.tempBlog";
        // let tempIPNSFile = "/tmp/.ipns.json";

        // fs.writeFileSync(tempFile, content, 'utf8');
        // this.dlogs.lookUpByAddr(this.dlogs.getAccount()).then((ipns) => {
        //     this.dlogs.ipfsPut(tempFile).then(r => {
        //         this.dlogs.pullIPNS(ipns).then(metaJSON => {
        //             let newArticle = { title, author: this.dlogs.getAccount(), timestamp: Date.now(), TLDR, };
        //             let newJSON = { ...metaJSON };
        //             newJSON.Articles = { ...newJSON.Articles, [r[0].hash]: newArticle };
        //             fs.writeFileSync(tempIPNSFile, JSON.stringify(newJSON), 'utf8');
        //             this.dlogs.ipfsPut(tempIPNSFile).then(r => {
        //                 this.dlogs.ipnsPublish(r[0].hash).then((rc) => {
        //                     fs.unlinkSync(tempFile);
        //                     fs.unlinkSync(tempIPNSFile);
        //                 })
        //             })
        //         })
        //     })
        // })

        this.ipfsClient.add([Buffer.from(content)], (err, filesAdded) => {
            if (err) { throw err }
    
            const hash = filesAdded[0].hash
            this.setState({ added_file_hash: hash })
            this.ipfs.cat(hash, (err, data) => {
                if (err) { throw err }
                let title = "This is blog " + this.state.blogs.length;
                let TLDR = data.toString()
                let blog = {title, TLDR }
                let blogs = [...this.state.blogs, blog]
                this.setState({ added_file_contents: data.toString(), blogs : blogs})
              })
        })
    }

    onDeleteBlog = (ipfsHash) => {
        let tempIPNSFile = "/tmp/.ipns.json";
        this.dlogs.lookUpByAddr(this.dlogs.getAccount()).then((ipns) => {
            this.dlogs.pullIPNS(ipns).then(metaJSON => {
                let newJSON = { ...metaJSON };
                let articles = newJSON.Articles;
                articles[ipfsHash] = undefined;
                newJSON.Articles = articles;
                fs.writeFileSync(tempIPNSFile, JSON.stringify(newJSON), 'utf8');
                this.dlogs.ipfsPut(tempIPNSFile).then(r => {
                    this.dlogs.ipnsPublish(r[0].hash).then((rc) => {
                        fs.unlinkSync(tempIPNSFile);
                    })
                })
            })
        })
    }


    onEditBlog = (title, TLDR, content, ipfsHash) => {
        let tempFile = "/tmp/.tempBlog";
        let tempIPNSFile = "/tmp/.ipns.json";

        fs.writeFileSync(tempFile, content, 'utf8');
        this.dlogs.lookUpByAddr(this.dlogs.getAccount()).then((ipns) => {
            this.dlogs.ipfsPut(tempFile).then(r => {
                console.log(r);
                this.dlogs.pullIPNS(ipns).then(metaJSON => {
                    let newArticle = { title, author: this.dlogs.getAccount(), timestamp: Date.now(), TLDR, };
                    let newJSON = { ...metaJSON };
                    let articles = newJSON.Articles;
                    articles[ipfsHash] = undefined;
                    newJSON.Articles = articles;
                    newJSON.Articles = { ...newJSON.Articles, [r[0].hash]: newArticle };
                    fs.writeFileSync(tempIPNSFile, JSON.stringify(newJSON), 'utf8');
                    this.dlogs.ipfsPut(tempIPNSFile).then(r => {
                        this.dlogs.ipnsPublish(r[0].hash).then((rc) => {
                            fs.unlinkSync(tempFile);
                            fs.unlinkSync(tempIPNSFile);
                        })
                    })
                })
            })
        })
    }

    onUnlock = (pw) => {
        this.dlogs.client.request('unlock', [pw]).then((rc) => {
            if (!rc.result) return false;
            this.dlogs.allAccounts().then((addr) => {
                this.dlogs.linkAccount(addr[0]).then(r => {
                    if (r) {
                        this.setState({ login: true, account: this.dlogs.getAccount() })
                    }
                })
            })
        })
    }

    onRefresh = () => {
        this.setState({ blogs: [] });
        this.initializeState();
    }


}


DlogsStore.id = "DlogsStore"

export default DlogsStore;
