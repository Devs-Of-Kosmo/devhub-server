package team.devs.devhub.domain.message.domain;

import jakarta.persistence.*;
import lombok.*;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;
import team.devs.devhub.global.common.DeleteCondition;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Message extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;

    @Column(length = 100)
    private String content;

    @Column(length = 200 ,name = "invite_url", nullable = false)
    private String inviteUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // 메시지 확인 여부
    @Column(nullable = false)
    private boolean readCondition;

    // 메시지 삭제여부
    @Column(nullable = false)
    private boolean senderDeleteCondition;

    @Column(nullable = false)
    private boolean receiverDeleteCondition;

    @Builder
    public Message(String content, Long id, String inviteUrl, boolean readCondition, User receiver, boolean receiverDeleteCondition, User sender, boolean senderDeleteCondition) {
        this.content = content;
        this.id = id;
        this.inviteUrl = inviteUrl;
        this.readCondition = readCondition;
        this.receiver = receiver;
        this.receiverDeleteCondition = receiverDeleteCondition;
        this.sender = sender;
        this.senderDeleteCondition = senderDeleteCondition;
    }

    // 삭제 관련 메소드
    public void updateSenderDeleteCondition(boolean senderDeleteCondition){
        this.senderDeleteCondition = senderDeleteCondition;
    }

    public void updateReceiverDeleteCondition(boolean receiverDeleteCondition){
        this.receiverDeleteCondition = receiverDeleteCondition;
    }
    
    // 쪽지 읽음 여부 관련 메소드
    public void readCondition(boolean readCondition) {
        this.readCondition = readCondition;
    }
}