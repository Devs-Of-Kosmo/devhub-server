package team.devs.devhub.domain.board.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import team.devs.devhub.domain.board.domain.entity.Board;


import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDto {
    private Long id;
    private String title;
    private String content;
    private String writer;
    private LocalDateTime createDate;
    private String imagePath;

    public BoardDto(Board board) {
        this.id = board.getId();
        this.title = board.getTitle();
        this.content = board.getContent();
        this.writer = board.getWriter();
        this.createDate = board.getCreateDate();
        this.imagePath = board.getImagePath();
    }

    public Board toEntity() {
        return new Board(this.id, this.title, this.content, this.writer, this.createDate, this.imagePath);
    }
}
