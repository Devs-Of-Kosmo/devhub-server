package team.devs.devhub.domain.message.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.message.domain.Message;
import team.devs.devhub.domain.user.domain.User;

import java.util.List;
import java.util.Optional;


public interface MessageRepository extends JpaRepository<Message, Long> {

    // 보낸 쪽지함
    List<Message> findBySenderAndSenderDeleteConditionOrderByCreatedDateDesc(User sender, Boolean senderDeleteCondition);

    // 받은 쪽지함
    List<Message> findByReceiverAndReceiverDeleteConditionOrderByCreatedDateDesc(User receiver, Boolean receiverDeleteCondition);

    // 읽지 않은 메시지 개수
    Optional<Long> countByReceiverAndReadConditionAndReceiverDeleteCondition(User user, Boolean readCondition, Boolean receiverDeleteCondition);

}
