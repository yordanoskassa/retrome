import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Alert, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import { theme } from '../../constants/theme'
import { Feather, Ionicons, SimpleLineIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { getUserImageSrc } from '../../services/imageService'
import { Image } from 'expo-image';
import Header from '../../components/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Icon from '../../assets/icons'
import Avatar from '../../components/Avatar'
import { supabase } from '../../lib/supabase'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { useFonts } from 'expo-font'

var limit = 0;
const Profile = () => {
  const {user, setAuth} = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // first do this
  const [fontsLoaded] = useFonts({
    'retromefont': require('../../assets/fonts/retromefont.ttf'),
    'cafedeparis': require('../../assets/fonts/CafeDeParisSans.ttf'),
  });

  // Add useEffect to load posts initially
  useEffect(() => {
    // Reset limit when component mounts
    limit = 0;
    getPosts();
  }, []);

  const getPosts = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      limit = limit + 10;
      console.log('fetching posts: ', limit);
      
      let res = await fetchPosts(limit, user.id);
      if (res.success) {
        // Check if we got fewer posts than requested
        const newPosts = res.data;
        if (newPosts.length === posts.length) {
          setHasMore(false);
        } else {
          setPosts(newPosts);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const onLogout = async () => {
    setAuth(null);
    const {error} = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
}

  const handleLogout = ()=>{
    Alert.alert('Confirm', 'Are you sure you want log out?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel'),
          style: 'cancel',
        },
        {
            text: 'Logout', 
            onPress: () => onLogout(),
            style: 'destructive'
        },
    ]);
  }

  const renderGridItem = ({ item }) => (
    <Pressable 
      style={styles.gridItem}
      onPress={() => router.push(`/postDetails/${item.id}`)}
    >
      <Image
        source={{ uri: item.file }}
        style={styles.gridImage}
        contentFit="cover"
      />
    </Pressable>
  );

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader 
            user={user} 
            handleLogout={handleLogout} 
            router={router}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        }
        ListHeaderComponentStyle={{marginBottom: 20}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listStyle,
          viewMode === 'grid' && styles.gridContainer
        ]}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 3 : 1}
        keyExtractor={(item) => item.id.toString()}
        renderItem={viewMode === 'grid' ? renderGridItem : ({ item }) => (
          <PostCard 
            item={item} 
            currentUser={user}
            router={router} 
          />
        )}
        onEndReached={getPosts}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && (
            <View style={{marginTop: 100}}>
              <Text style={styles.noPosts}>No posts yet</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading ? (
            <View style={{marginTop: posts.length === 0 ? 100 : 30}}>
              <Loading />
            </View>
          ) : posts.length > 0 && !hasMore ? (
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  )
}

const UserHeader = ({user, handleLogout, router, viewMode, setViewMode})=>{
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  return (
    <View style={styles.headerWrapper}> 
        <View>
          <Header title="Profile" mb={30} />
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.viewModeButton} 
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Text style={styles.viewModeText}>
                {viewMode === 'grid' ? '☰' : '⊞'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={[styles.viewModeText, { color: theme.colors.rose }]}>
                ⎋
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.container}>
          <View style={styles.profileContent}>
            {/* avatar */}
            <View style={styles.avatarContainer}>
              <Avatar
                uri={user?.image}
                size={hp(12)} // Smaller size
                rounded={hp(12)}
              />
              <Pressable 
                style={styles.editIcon} 
                onPress={()=> router.push('/editProfile')}
              >
                <Icon name="edit" strokeWidth={2} size={hp(2)} color={theme.colors.text} />
              </Pressable>
            </View>
          
            {/* username & address */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              {user?.address && (
                <Text style={styles.addressText}>{user.address}</Text>
              )}
            </View>

            {/* Bio */}
            {user?.bio && (
              <Text style={styles.bioText}>{user.bio}</Text>
            )}

            {/* Contact icons */}
            <View style={styles.contactIcons}>
              <Pressable 
                style={styles.iconButton} 
                onPress={() => setShowEmail(!showEmail)}
              >
                <Icon name="mail" size={hp(2.2)} color={theme.colors.textLight} />
                {showEmail && (
                  <Text style={styles.contactText}>{user?.email}</Text>
                )}
              </Pressable>
              
              {user?.phoneNumber && (
                <Pressable 
                  style={styles.iconButton} 
                  onPress={() => setShowPhone(!showPhone)}
                >
                  <Icon name="call" size={hp(2.2)} color={theme.colors.textLight} />
                  {showPhone && (
                    <Text style={styles.contactText}>{user.phoneNumber}</Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerWrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: hp(2),
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileContent: {
    gap: hp(2.5),
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    borderRadius: hp(12),
    alignSelf: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: hp(1),
    borderRadius: hp(3),
    backgroundColor: theme.colors.gray,
    shadowColor: theme.colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  userInfo: {
    alignItems: 'center',
    gap: hp(0.5),
  },
  userName: {
    fontSize: hp(3.2),
    color: theme.colors.text,
    fontFamily: 'retrome',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    fontFamily: 'cafedeparis',
  },
  bioText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: 'cafedeparis',
    paddingHorizontal: wp(8),
    lineHeight: hp(2.5),
  },
  contactInfo: {
    width: '100%',
    gap: hp(1.5),
    paddingTop: hp(1),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.md,
  },
  infoText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    fontFamily: 'cafedeparis',
  },
  logoutButton: {
    padding: hp(1),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.gray,
    width: hp(4.5),
    height: hp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
    fontFamily: 'cafedeparis',
  },
  headerButtons: {
    flexDirection: 'row',
    position: 'absolute',
    right: wp(4),
    top: 0,
    gap: wp(3),
  },
  viewModeButton: {
    padding: hp(1),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.gray,
    width: hp(4.5),
    height: hp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcons: {
    flexDirection: 'row',
    gap: wp(4),
    marginTop: hp(1),
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    padding: hp(1),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.gray,
  },
  contactText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontFamily: 'cafedeparis',
  },
  gridItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 1, // Small gap between grid items
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    paddingHorizontal: 0, // Remove horizontal padding for grid
  },
  viewModeText: {
    color: theme.colors.text,
    fontSize: hp(2.4),
    textAlign: 'center',
  },
});

export default Profile