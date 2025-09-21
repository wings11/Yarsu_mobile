import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useJobs } from "@/hooks/useJobs";
import { formatDate } from "@/libs/utils";
import * as jobStylesModule from "@/assets/styles/job.styles";
import MediaPlayer from "@/components/MediaPlayer";

// jobStylesModule may export the styles object as named or default export. Normalize and cast to any.
const styles = ((jobStylesModule as any).styles || (jobStylesModule as any).default || jobStylesModule) as any;

type JobType = {
  id: number;
  title: string;
  job_location: string;
  location?: string;
  created_at: string;
  notes?: string;
  pinkcard?: boolean;
  thai?: boolean;
  stay?: boolean;
  job_num?: string;
  media?: string | string[];
  job_date?: string;
  payment?: string;
  pay_amount?: string | number;
  accept_amount?: number;
  accept?: string;
  treat?: boolean;
};

const Job = () => {
  const { jobs, loadJobs } = useJobs() as { jobs: JobType[]; loadJobs: () => void };
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [showModal, setShowModal] = useState(false);
  // playing/loading handled inside MediaPlayer component now

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const insets = useSafeAreaInsets();

  const handleSelectJob = (job: JobType) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  useEffect(() => {
    // nothing to do here for media state (handled by MediaPlayer)
  }, [showModal]);

  // Media rendering replaced by reusable MediaPlayer component

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelectJob(item)}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>အလုပ်နံပါတ်: {item.job_num || "N/A"}</Text>
              <Text style={styles.subtitle}>ရက်စွဲ: {item.job_date || "N/A"}</Text>
              <Text style={styles.subtitle}>အလုပ်နေရာ: {item.job_location || item.location || "N/A"}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.title}>အလုပ်များမရှိသေးပါ</Text>}
      />
      <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
        {/* overlay will not close modal on tap; user must press Close */}
        <View style={styles.customModalOverlay}>
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}> 
            <SafeAreaView edges={["top"]} style={{ width: '100%' }}>
              <View style={styles.customModalContent}>
                <ScrollView style={styles.modalBody}>
                  {/* Close button (top-right) */}
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={20} color={styles.modalCloseText.color || '#fff'} />
                  </TouchableOpacity>
                  {selectedJob && (
                    <>
                      {selectedJob.title ? <View style={styles.modalRow}><Text style={styles.modalLabel}>အလုပ်နာမည်:</Text><Text style={styles.modalValue}>{selectedJob.title}</Text></View> : null}
                      {selectedJob.job_num ? <View style={styles.modalRow}><Text style={styles.modalLabel}>အလုပ်နံပါတ်:</Text><Text style={styles.modalValue}>{selectedJob.job_num}</Text></View> : null}
                      {selectedJob.job_date ? <View style={styles.modalRow}><Text style={styles.modalLabel}>ရက်စွဲ:</Text><Text style={styles.modalValue}>{selectedJob.job_date}</Text></View> : null}
                      {(selectedJob.job_location || selectedJob.location) ? <View style={styles.modalRow}><Text style={styles.modalLabel}>အလုပ်နေရာ:</Text><Text style={styles.modalValue}>{selectedJob.job_location || selectedJob.location}</Text></View> : null}
                      {selectedJob.payment ? <View style={styles.modalRow}><Text style={styles.modalLabel}>ငွေပေးချေပုံ:</Text><Text style={styles.modalValue}>{selectedJob.payment}</Text></View> : null}
                      {selectedJob.pay_amount ? <View style={styles.modalRow}><Text style={styles.modalLabel}>လစာ:</Text><Text style={styles.modalValue}>{selectedJob.pay_amount}</Text></View> : null}
                      {selectedJob.accept_amount ? <View style={styles.modalRow}><Text style={styles.modalLabel}>လက်ခံသည့်ဦးရေ:</Text><Text style={styles.modalValue}>{selectedJob.accept_amount}</Text></View> : null}
                      {selectedJob.accept ? <View style={styles.modalRow}><Text style={styles.modalLabel}>လက်ခံသည်:</Text><Text style={styles.modalValue}>{selectedJob.accept}</Text></View> : null}
                      {selectedJob.pinkcard !== undefined ? <View style={styles.modalRow}><Text style={styles.modalLabel}>အထောက်အထားရှိရန်:</Text><Text style={styles.modalValue}>{selectedJob.pinkcard ? "Yes" : "No"}</Text></View> : null}
                      {selectedJob.thai !== undefined ? <View style={styles.modalRow}><Text style={styles.modalLabel}>ထိုင်းစကားတတ်ရန်:</Text><Text style={styles.modalValue}>{selectedJob.thai ? "Yes" : "No"}</Text></View> : null}
                      {selectedJob.stay !== undefined ? <View style={styles.modalRow}><Text style={styles.modalLabel}>နေစရာ:</Text><Text style={styles.modalValue}>{selectedJob.stay ? "Yes" : "No"}</Text></View> : null}
                      {selectedJob.treat !== undefined ? <View style={styles.modalRow}><Text style={styles.modalLabel}>ထမင်း :</Text><Text style={styles.modalValue}>{selectedJob.treat ? "Yes" : "No"}</Text></View> : null}
                      {selectedJob.notes ? <View style={styles.modalRow}><Text style={styles.modalLabel}>မှတ်ချက်:</Text><Text style={styles.modalValue}>{selectedJob.notes}</Text></View> : null}
                      {selectedJob.created_at ? <View style={styles.modalRow}><Text style={styles.modalLabel}>Posted Date:</Text><Text style={styles.modalValue}>{formatDate(selectedJob.created_at)}</Text></View> : null}
                      {/* Media always shown if present */}
                      {selectedJob.media ? (
                        <View style={[styles.modalRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 16 }]}> 
                          <Text style={styles.modalLabel}>Media:</Text>
                          <MediaPlayer media={selectedJob.media} width={300} height={180} />
                        </View>
                      ) : null}
                    </>
                  )}
                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Job;

