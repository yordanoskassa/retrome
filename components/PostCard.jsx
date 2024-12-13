import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '../constants/theme';
import { Image } from 'expo-image';
import { downloadFile, getSupabaseFileUrl, getUserImageSrc } from '../services/imageService';
import { hp, stripHtmlTags, wp } from '../helpers/common';
import moment from 'moment';
import RenderHtml from 'react-native-render-html';
import Icon from '../assets/icons';
import { Video } from 'expo-av';
import { createPostLike, removePostLike } from '../services/postService';
import Loading from './Loading';
import Avatar from './Avatar';
import { useFonts } from 'expo-font';

const PostCard = ({
  item,
  currentUser,
  router,
  showMoreIcon = true,
  hasShadow = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Font loading
  const [fontsLoaded] = useFonts({
    retromefont: require('../assets/fonts/retromefont.ttf'),
    cafedeparis: require('../assets/fonts/CafeDeParisSans.ttf'),
  });

  if (!fontsLoaded) {
    return <Loading size="large" />;
  }

  const liked = !!likes.find((like) => like.userId === currentUser?.id);
  const createdAt = moment(item?.created_at).format('MMM D');
  const htmlBody = { html: item?.body };

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item]);

  const onLike = async () => {
    if (liked) {
      const updatedLikes = likes.filter((like) => like.userId !== currentUser?.id);
      setLikes(updatedLikes);

      const res = await removePostLike(item?.id, currentUser?.id);
      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    } else {
      const data = {
        userId: currentUser?.id,
        postId: item?.id,
      };

      setLikes([...likes, data]);
      const res = await createPostLike(data);
      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    }
  };

  const onShare = async () => {
    const content = { message: stripHtmlTags(item?.body) };
    if (item?.file) {
      setLoading(true);
      const uri = await downloadFile(getSupabaseFileUrl(item.file).uri);
      content.url = uri;
      setLoading(false);
    }
    Share.share(content);
  };

  const handlePostDelete = () => {
    Alert.alert('Confirm', 'Are you sure you want to do this?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel delete'),
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => onDelete(item),
        style: 'destructive',
      },
    ]);
  };

  const openPostDetails = () => {
    router.push({ pathname: 'postDetails', params: { postId: item?.id } });
  };

  return (
    <View style={[styles.container, hasShadow && styles.shadow]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.8)}
            uri={item?.user?.image}
            
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>
        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {showDelete && currentUser?.id === item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.content}>
        {item?.body && (
          <RenderHtml
            contentWidth={wp(100)}
            source={htmlBody}
            tagsStyles={{
              div: styles.textStyle,
              p: styles.textStyle,
              h1: { color: theme.colors.dark },
              h4: { color: theme.colors.dark },
            }}
          />
        )}
        {item?.file?.includes('postImages') && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}
        {item?.file?.includes('postVideos') && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item?.file)}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}
      </View>
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name="heart"
              fill={liked ? theme.colors.rose : 'transparent'}
              size={24}
              color={liked ? theme.colors.rose : theme.colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{item?.comments?.[0]?.count || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    padding: 10,
    paddingVertical: 12,
  },
  shadow: {
    // Removed shadow properties entirely
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: hp(2.5),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
    fontFamily: 'cafedeparis',
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postMedia: {
    height: hp(40),
    width: '100%',
    borderRadius: 0, // Ensure sharp edges
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  textStyle: {
    color: theme.colors.dark,
    fontSize: hp(1.75),
    fontFamily: 'retromefont',
    lineHeight: hp(2.5),
    fontWeight: theme.fonts.regular,
  },
});


export default PostCard;
