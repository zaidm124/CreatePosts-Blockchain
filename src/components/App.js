import React, { Component } from "react";
import "./App.css";
import SocialNetwork from "../abis/SocialNetwork.json";
import Web3 from "web3";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockChain();
    await this.listPosts();
  }

  async loadBlockChain() {
    const web3 = window.web3;
    // load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Network ID
    const networkId = await web3.eth.net.getId();
    console.log(networkId);

    // Address
    const networkData = SocialNetwork.networks[networkId];
    if (networkData) {
      console.log(networkData.address);
      const socialNetwork = await web3.eth.Contract(
        SocialNetwork.abi,
        networkData.address
      );
      console.log(socialNetwork);
      this.setState({ socialNetwork: socialNetwork });
      let postCount = await socialNetwork.methods.postCount().call();
      this.setState({ postCount: postCount });
    } else {
      console.log("Social Network contract not deployed to detected network");
    }
  }

  async loadWeb3() {
    if (window.etheruem) {
      window.web3 = new Web3(window.etheruem);
      await window.etheruem.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-ethereum browser detected. You should consider trying metaMask"
      );
    }
    this.setState({ loading: false });
  }

  tipPost = async (id) => {
    this.setState({ loading: true });
    await this.state.socialNetwork.methods
      .tipPost(id)
      .send({ from: this.state.account, value: "100000000000000000" })
      .on("transactionHash", () => {
        this.setState({ laoding: false });
      })
      .on("confirmation", () => {
        window.location.reload();
      });
  };

  createPosts = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    await this.state.socialNetwork.methods
      .createPost(this.state.input)
      .send({ from: this.state.account })
      .on("transactionHash", () => {
        this.setState({ loading: false });
      })
      .on("confirmation", () => {
        window.location.reload();
      })
      .on("error", () => {
        this.setState({ loading: false });
        window.alert("Failed to create a post");
      });
  };

  listPosts = async () => {
    console.log(this.state.account);
    console.log(this.state.postCount);
    for (var i = 1; i <= this.state.postCount; i++) {
      const post = await this.state.socialNetwork.methods.posts(i).call();
      this.setState({
        posts: [...this.state.posts, post],
      });
    }

    console.log(this.state.posts);
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      account: "",
      socialNetwork: null,
      postCount: 0,
      posts: [],
      input: "",
      id: 0,
    };
  }
  render() {
    let content;
    if (this.state.loading) {
      content = (
        <>
          <h1>Loading...</h1>
        </>
      );
    } else {
      content = (
        <>
          <div className="">
            <div className="input">
              <form onSubmit={this.createPosts}>
                <input
                  className="margin"
                  type="text"
                  value={this.state.input}
                  onChange={(e) => this.setState({ input: e.target.value })}
                  name=""
                  id=""
                />
                <br />
                <button className="button" type="submit">
                  Create Post
                </button>
              </form>
            </div>
            {this.state.posts.map((value, key) => {
              return (
                <>
                  <div className="box">
                    <div className="address">{value.author}</div>

                    <div className="cont">{value.content}</div>

                    <div className="tipDetails">
                      <div className="tippedAmount">
                        {`Tips `}
                        {window.web3.utils.fromWei(value.tipAmount.toString())}
                      </div>
                      <div
                        className="tip"
                        onClick={() => this.tipPost(key + 1)}
                      >
                        Tip 0.1Eth
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </>
      );
    }

    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            {this.state.account}
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
