package team.devs.devhub.domain.board.domain.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

@Entity
@Table(name = "boards")
@NoArgsConstructor
@Getter
@Setter
public class Board extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String title;

    @Column(length = 400, nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private User writer;

    @Column(name = "image_path")
    private String imagePath;

    @Builder
    public Board(Long id, String title, String content, User writer, String imagePath) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.writer = writer;
        this.imagePath = imagePath;
    }

    public void updateBoard(String title, String content, String imagePath) {
        this.title = title;
        this.content = content;
        this.imagePath = imagePath;
    }
}
