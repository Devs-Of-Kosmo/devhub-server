package team.devs.devhub.domain.board.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.board.domain.domain.Board;

@Getter
@Builder
@AllArgsConstructor
public class BoardResponse {

    private Long id;
    private String title;
    private String content;
    private String writer;
    private String imagePath;

    public static BoardResponse of(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(String.valueOf(board.getWriter()))
                .imagePath(board.getImagePath())
                .build();
    }
}
