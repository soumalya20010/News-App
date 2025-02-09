import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from './Spinner';
import PropTypes from 'prop-types';

const News = (props) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getApiUrl = () => {
    if (props.apiKey === process.env.REACT_APP_INDIA) {
      // return `https://newsdata.io/api/1/latest?apikey=${props.apiKey}&q=india`;
     
     return `https://newsdata.io/api/1/news?apikey=${props.apiKey}&q=${props.category}`;
    } else {
      return `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`;
    }
  };

  const updateNews = async () => {
    props.setProgress(10);
    const url = getApiUrl();
    console.log(url);
    setLoading(true);
    try {
      let data = await fetch(url);
      props.setProgress(30);
      let parsedData = await data.json();
      console.log('API Response:', parsedData); // Log the API response
      props.setProgress(70);
      setArticles(parsedData.articles || parsedData.results || []);
      setTotalResults(parsedData.totalResults || parsedData.totalResults || 0);
      setLoading(false);
      props.setProgress(100);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
      props.setProgress(100);
    }
  };

  useEffect(() => {
    document.title = `${capitalizeFirstLetter(props.category)} - NewsToday`;
    updateNews();
    // eslint-disable-next-line
  }, []);

  const fetchMoreData = async () => {
    const url = getApiUrl();
    setPage(page + 1);
    try {
      let data = await fetch(url);
      let parsedData = await data.json();
      console.log('API Response:', parsedData);
      setArticles(articles.concat(parsedData.articles || parsedData.results || []));
      setTotalResults(parsedData.totalResults || parsedData.totalResults || 0);
    } catch (error) {
      console.error('Error fetching more news:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>
         {capitalizeFirstLetter(props.category)} Headlines
      </h1>
      {loading && <Spinner />}
      <InfiniteScroll
        dataLength={articles.length}
        next={fetchMoreData}
        hasMore={articles.length !== totalResults}
        loader={<Spinner />}
      >
        <div className="row">
          {Array.isArray(articles) && articles.map((article, index) => (
            <div className="col-md-4" key={index}>
              <div className="card">
                <img src={article.urlToImage || article.image_url} className="card-img-top" alt="..." />
                <div className="card-body">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text">{article.description}</p>
                  <a href={article.url || article.link} className="btn btn-primary">
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

News.defaultProps = {
  country: 'us',
  pageSize: 5,
  category: 'general',
};

News.propTypes = {
  country: PropTypes.string,
  pageSize: PropTypes.number,
  category: PropTypes.string,
  apiKey: PropTypes.string.isRequired,
  setProgress: PropTypes.func.isRequired,
};

export default News;