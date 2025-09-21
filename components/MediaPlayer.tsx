import React, { useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video as ExpoAVVideo } from 'expo-av';

type Props = {
  media?: string | string[];
  width?: number;
  height?: number;
  showDiagnostics?: boolean; // when true, perform HEAD preflight and show headers
};

const parseMedia = (media: string | string[] | undefined): string[] => {
  let mediaArray: string[] = [];
  try {
    if (!media) mediaArray = [];
    else if (Array.isArray(media)) mediaArray = media;
    else if (typeof media === "string") {
      const trimmed = media.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) mediaArray = parsed;
        else mediaArray = [String(parsed)];
      } else if (trimmed.startsWith('"[') || trimmed.startsWith("'[")) {
        const parsedOnce = JSON.parse(trimmed);
        const parsed = typeof parsedOnce === "string" ? JSON.parse(parsedOnce) : parsedOnce;
        mediaArray = Array.isArray(parsed) ? parsed : [String(parsed)];
      } else if (trimmed.includes(",") && !trimmed.includes(" ")) {
        mediaArray = trimmed.split(",").map((s) => s.trim());
      } else {
        mediaArray = [trimmed];
      }
    }
  } catch {
    if (typeof media === "string" && media.startsWith("http")) mediaArray = [media];
    else mediaArray = [];
  }
  return mediaArray;
};

const isVideo = (u: string) => {
  const v = u.split("?")[0].toLowerCase();
  return v.endsWith(".mp4") || v.endsWith(".mov") || v.endsWith(".webm") || v.includes("video");
};

export default function MediaPlayer({ media, width = 300, height = 180, showDiagnostics = true }: Props) {
  const mediaArray = parseMedia(media);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [diagnosticsMap, setDiagnosticsMap] = useState<Record<number, any>>({});
  // Helper to pick a renderable component from a module or object
  const resolveRenderable = (mod: any) => {
    if (!mod) return null;
    const candidates = [mod, mod?.default, mod?.Video, mod?.ExpoVideo];
    for (const c of candidates) {
      if (typeof c === "function") return c;
    }
    return null;
  };

  // default to expo-av's Video (resolve callable shape)
  const [VideoComponent, setVideoComponent] = useState<any>(() => resolveRenderable(ExpoAVVideo));

  // Try to prefer expo-video if available (optional). If not, we keep expo-av Video.
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod: any = await import("expo-video");
        const candidate = resolveRenderable(mod);
        if (mounted && candidate) {
          setVideoComponent(candidate);
          return;
        }
      } catch {
        // ignore — we'll use expo-av by default
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (mediaArray.length === 0) return null;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
      {mediaArray.map((url, idx) => {
        if (isVideo(url)) {
          const isPlaying = playingIndex === idx;
          return (
            <View key={idx} style={{ margin: 5 }}>
                  {!isPlaying ? (
                <TouchableOpacity
                  style={[styles.thumbnail, { width, height }]}
                  onPress={async () => {
                        // perform HEAD preflight when diagnostics enabled
                        if (showDiagnostics) {
                          try {
                            const start = Date.now();
                            const resp = await fetch(url, { method: 'HEAD' });
                            const took = Date.now() - start;
                            const size = resp.headers.get('content-length') || resp.headers.get('Content-Length');
                            const ctype = resp.headers.get('content-type') || resp.headers.get('Content-Type');
                            const ranges = resp.headers.get('accept-ranges') || resp.headers.get('Accept-Ranges');
                            const cache = resp.headers.get('cf-cache-status') || resp.headers.get('CF-Cache-Status') || resp.headers.get('cache-control');
                            setDiagnosticsMap((m) => ({ ...m, [idx]: { size, ctype, ranges, cache, took } }));
                          } catch (e) {
                            setDiagnosticsMap((m) => ({ ...m, [idx]: { error: String(e) } }));
                          }
                        }
                        setPlayingIndex(idx);
                        setLoadingIndex(idx);
                  }}
                >
                  <Image source={{ uri: url }} style={[styles.thumbnailImg, { width, height }]} resizeMode="cover" />
                  <View style={[styles.playOverlay, { width, height }]}>
                    <Ionicons name="play" size={36} color="#fff" />
                  </View>
                </TouchableOpacity>
                  ) : (
                    <View>
                      {(() => {
                        const ComponentToRender = resolveRenderable(VideoComponent);
                        if (!ComponentToRender) {
                          // graceful fallback: show a placeholder and allow opening externally
                          return (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(url)}
                              style={{ width, height, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}
                            >
                              <Ionicons name="play" size={36} color="#fff" />
                            </TouchableOpacity>
                          );
                        }

                        // Use React.createElement to support function/class components
                        return React.createElement(ComponentToRender as any, {
                          key: `video-${idx}`,
                          source: { uri: url },
                          style: { width, height, borderRadius: 8, backgroundColor: '#000' },
                          useNativeControls: true,
                          isLooping: false,
                          resizeMode: 'contain',
                          shouldPlay: true,
                          onPlaybackStatusUpdate: (status: any) => {
                            if (status?.isLoaded && loadingIndex === idx) setLoadingIndex(null);
                            if (status?.didJustFinish) {
                              // stop playing when finished
                              setPlayingIndex(null);
                            }
                          }
                        });
                      })()}
                      {loadingIndex === idx && (
                        <View style={[styles.loadingOverlay, { width, height }]}>
                          <ActivityIndicator size="large" color="#fff" />
                        </View>
                      )}
                      {/* diagnostics overlay (small) */}
                      {diagnosticsMap[idx] && (
                        <View style={styles.diagnosticsBox} pointerEvents="none">
                          {diagnosticsMap[idx].error ? (
                            <Text style={styles.diagnosticsText}>ERR: {diagnosticsMap[idx].error}</Text>
                          ) : (
                            <>
                              <Text style={styles.diagnosticsText}>type: {diagnosticsMap[idx].ctype || 'n/a'}</Text>
                              <Text style={styles.diagnosticsText}>size: {diagnosticsMap[idx].size ? (Number(diagnosticsMap[idx].size) / (1024*1024)).toFixed(2) + 'MB' : 'n/a'}</Text>
                              <Text style={styles.diagnosticsText}>ranges: {diagnosticsMap[idx].ranges || 'n/a'}</Text>
                              <Text style={styles.diagnosticsText}>cache: {diagnosticsMap[idx].cache || 'n/a'}</Text>
                              <Text style={styles.diagnosticsText}>latency: {diagnosticsMap[idx].took}ms</Text>
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  )}
            </View>
          );
        }

        return (
          <Image key={idx} source={{ uri: url }} style={{ width: 100, height: 100, margin: 5, borderRadius: 8 }} resizeMode="cover" />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbnailImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  playOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
  }
  ,
  diagnosticsBox: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 6,
  },
  diagnosticsText: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
  }
});
