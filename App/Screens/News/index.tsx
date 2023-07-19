import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, {useRef, useEffect, useState, useContext} from 'react';
import {newsStorage, openUrl} from '../../Constants/Storage';
import styles from './Styles';
import {NewsContext} from '../../Context/NewsContext';
import {ListItem} from '@rneui/themed';
import {Button} from '@rneui/base';

const FETCH_LIMIT = 5;
const COUNTER_TIMER = 10;
const News = () => {
  const {fetchNextNewsBatch} = useContext(NewsContext);

  let counterFunc = useRef();
  const counterTimer = useRef(COUNTER_TIMER);

  const [allNewsArray, setAllNewsArray] = useState([]);
  const [visibleNewsList, setVisibleNewsList] = useState([]);
  const [pinnedNews, setPinnedNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const listener = newsStorage.addOnValueChangedListener(() => {
      let newValue = newsStorage.getString('news');
      if (newValue) {
        newValue = JSON.parse(newValue);
        setVisibleNewsList(() => newValue?.slice(0, 10));
        setAllNewsArray(() => newValue);
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (
      allNewsArray?.length &&
      setVisibleNewsList?.length &&
      !counterFunc.current
    ) {
      startTimer();
    }
    return () => {
      clearInterval(counterFunc);
    };
  }, [allNewsArray, visibleNewsList]);

  const startTimer = () => {
    counterFunc = setInterval(() => {
      counterTimer.current = counterTimer.current - 1;
      if (counterTimer.current <= 0) {
        onRefresh();
      }
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNewData();
  };

  const fetchNewData = () => {
    if (allNewsArray?.length <= visibleNewsList?.length) {
      fetchNextNewsBatch();
    } else {
      setVisibleNewsList(() => [
        ...allNewsArray?.slice(
          visibleNewsList?.length,
          visibleNewsList?.length + FETCH_LIMIT,
        ),
        ...visibleNewsList,
      ]);
    }
    counterTimer.current = COUNTER_TIMER;
    setRefreshing(false);
  };

  const keyExtractor = item => item._id;

  const pinNews = news => {
    setPinnedNews([news, ...pinnedNews]);
  };

  const deleteNews = (index: number) => {
    let newVisibleNewsList = [...visibleNewsList];
    let newAllNewsArray = [...allNewsArray];

    let deletedItem = newVisibleNewsList.splice(index, 1);
    let newsIndex = allNewsArray.findIndex(
      item => item?._id === deletedItem[0]._id,
    );
    newAllNewsArray.splice(newsIndex, 1);

    setVisibleNewsList(newVisibleNewsList);
    setAllNewsArray(newAllNewsArray);
  };

  const renderNews = ({item, index, type}) => {
    return (
      <ListItem.Swipeable
        leftContent={reset => (
          <Button
            title="Pin"
            onPress={() => {
              reset();
              pinNews(item);
            }}
            buttonStyle={styles.actionButton}
          />
        )}
        rightContent={reset => (
          <Button
            title="Delete"
            onPress={() => {
              reset();
              deleteNews(index);
            }}
            buttonStyle={[styles.actionButton, styles.deleteButton]}
          />
        )}>
        <View style={[styles.cardView, type === 'pinned' && styles.cardBorder]}>
          <View style={styles.margin10}>
            <Text style={styles.cardTitle}>{item?.title}</Text>
            {item?.link ? (
              <TouchableOpacity onPress={() => openUrl(item?.link)}>
                <Text
                  numberOfLines={1}
                  style={[styles.marginTop5, styles.cardUrl]}>
                  {item?.link}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ListItem.Swipeable>
    );
  };

  return (
    <View style={styles.screen}>
      {pinnedNews?.length
        ? pinnedNews?.map(news => renderNews({item: news, type: 'pinned'}))
        : null}
      <FlatList
        data={visibleNewsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={keyExtractor}
        renderItem={renderNews}
      />
    </View>
  );
};

export default News;
