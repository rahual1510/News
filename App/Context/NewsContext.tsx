import React, {createContext, useEffect, useState} from 'react';
import {newsStorage} from '../Constants/Storage';
import SplashScreen from 'react-native-splash-screen';

const NEWS_URL =
  'https://api.newscatcherapi.com/v2/latest_headlines?countries=US&topic=business&page_size=30&page=';

const NewsContext = createContext({});

const NewsProvider = ({children}) => {
  const [newsPage, setNewsPage] = useState(1);

  useEffect(() => {
    newsStorage.delete('news');
    fetchNews();
  }, []);

  const fetchNews = () => {
    fetch(`${NEWS_URL}${newsPage}`, {
      headers: {
        'x-api-key': 'jer57kBYhgml9eDUor17PlU7HGRk4JbX_iKIXACZ_hw',
      },
    })
      .then(response => response.json())
      .then(json => {
        console.log('json', json);
        try {
          SplashScreen?.hide();
        } catch (e) {
          console.log('e', e);
        }
        if (json?.articles) {
          setNewsPage(json?.page + 1);
          addToLocalStorage(json.articles);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const addToLocalStorage = data => {
    newsStorage.set('news', JSON.stringify(data));
  };

  const fetchNextNewsBatch = () => {
    newsStorage.delete('news');
    fetchNews();
  };

  return (
    <NewsContext.Provider value={{fetchNextNewsBatch}}>
      {children}
    </NewsContext.Provider>
  );
};

export {NewsProvider, NewsContext};
