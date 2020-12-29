import React, { useEffect, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Dayjs from 'dayjs';
import { Attachment } from 'stream-chat';
import {
  FileIcon,
  getFileSizeDisplayText,
  goToURL,
  ThemeProvider,
  useTheme,
} from 'stream-chat-react-native/v2';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { usePaginatedAttachments } from '../hooks/usePaginatedAttachments';
import { File } from '../icons/File';
import { StackNavigatorParamList } from '../types';

type ChannelFilesScreenRouteProp = RouteProp<
  StackNavigatorParamList,
  'ChannelFilesScreen'
>;

export type ChannelFilesScreenProps = {
  route: ChannelFilesScreenRouteProp;
};

export const ChannelFilesScreen: React.FC<ChannelFilesScreenProps> = ({
  route: {
    params: { channel },
  },
}) => {
  const { loading, loadMore, messages } = usePaginatedAttachments(
    channel,
    'file',
  );
  const {
    theme: {
      colors: { black, white, white_snow },
    },
  } = useTheme();
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<
    Array<{
      data: Attachment[];
      title: string;
    }>
  >([]);

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const sections: Record<
      string,
      {
        data: Attachment[];
        title: string;
      }
    > = {};

    messages.forEach((message) => {
      const month = Dayjs(message.created_at as string).format('MMM YYYY');

      if (!sections[month]) {
        sections[month] = {
          data: [],
          title: month,
        };
      }

      message.attachments?.forEach((a) => {
        if (a.type !== 'file') return;

        sections[month].data.push(a);
      });
    });

    setSections(Object.values(sections));
  }, [messages]);

  return (
    <View
      style={{
        flexGrow: 1,
        flexShrink: 1,
        paddingBottom: insets.bottom,
      }}
    >
      <ScreenHeader titleText='Files' />
      <ThemeProvider>
        {(sections.length > 0 || !loading) && (
          <SectionList<Attachment>
            contentContainerStyle={{ height: '100%', paddingHorizontal: 16 }}
            ListEmptyComponent={EmptyListComponent}
            onEndReached={loadMore}
            renderItem={({ item: attachment }) => (
              <TouchableOpacity
                key={attachment.id}
                onPress={() => goToURL(attachment.asset_url)}
              >
                <View style={[{ backgroundColor: white }, styles.container]}>
                  <FileIcon mimeType={attachment.mime_type} />
                  <View style={[styles.details]}>
                    <Text numberOfLines={2} style={[styles.title]}>
                      {attachment.title}
                    </Text>
                    <Text style={[styles.size]}>
                      {getFileSizeDisplayText(attachment.file_size)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View
                style={{
                  backgroundColor: white_snow,
                  borderRadius: 10,
                  padding: 16,
                  paddingTop: 16,
                }}
              >
                <Text
                  style={{
                    color: black,
                    fontSize: 12,
                  }}
                >
                  {title}
                </Text>
              </View>
            )}
            sections={[]}
            stickySectionHeadersEnabled
          />
        )}
      </ThemeProvider>
    </View>
  );
};

const EmptyListComponent = () => {
  const {
    theme: {
      colors: { black, grey, grey_gainsboro },
    },
  } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        padding: 40,
        width: '100%',
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <File fill={grey_gainsboro} scale={6} />
        <Text style={{ color: black, fontSize: 16 }}>No files</Text>
        <Text style={{ color: grey, marginTop: 8, textAlign: 'center' }}>
          Files sent on this chat will appear here
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 8,
  },
  details: {
    paddingLeft: 16,
  },
  size: {
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
});